import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UsersDiseases } from './users-diseases.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersDiseasesService {
  private readonly logger = new Logger(UsersDiseasesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserDiseaseDto: Prisma.users_diseasesCreateInput) {
    if (!createUserDiseaseDto.users || !createUserDiseaseDto.diseases)
      throw new BadRequestException({ status: false, message: 'User and disease are required' });

    const userId = (createUserDiseaseDto.users as any).connect?.user_id;
    const diseaseId = (createUserDiseaseDto.diseases as any).connect?.disease_id;

    if (!userId || !diseaseId)
      throw new BadRequestException({ status: false, message: 'Valid user and disease IDs are required' });

    try {
      const existingRelation = await this.prisma.users_diseases.findFirst({
        where: {
          user_id: userId,
          disease_id: diseaseId,
        }
      });

      if (existingRelation) {
        throw new ConflictException({
          status: false,
          message: 'This disease is already assigned to this user'
        });
      }

      await this.prisma.users_diseases.create({
        data: createUserDiseaseDto,
      });

      await this.cacheManager.del(`users_diseases_*`);
      await this.cacheManager.del(`user_${userId}_diseases`);
      await this.cacheManager.del(`disease_${diseaseId}_users`);

      return { status: true, message: 'User disease created successfully' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error('Error to create user disease, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create user disease, invalid data' });
    }
  }

  async createMany(userDiseases: Prisma.users_diseasesUncheckedCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      const result = await this.prisma.users_diseases.createMany({
        data: userDiseases,
        skipDuplicates: true,
      });

      const uniqueUserIds = [...new Set(userDiseases.map(ud => ud.user_id))];
      const uniqueDiseaseIds = [...new Set(userDiseases.map(ud => ud.disease_id))];

      // Invalidar caché para cada usuario y enfermedad afectada
      for (const userId of uniqueUserIds) {
        await this.cacheManager.del(`user_${userId}_diseases`);
      }

      for (const diseaseId of uniqueDiseaseIds) {
        if (diseaseId) {
          await this.cacheManager.del(`disease_${diseaseId}_users`);
        }
      }

      await this.cacheManager.del('users_diseases_*');

      return {
        status: true,
        message: 'User diseases created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple user diseases', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating user diseases'
      });
    }
  }

  async assignDiseasesToUser(userId: string, diseaseIds: number[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }

      // Verificar que las enfermedades existen
      const diseases = await this.prisma.diseases.findMany({
        where: { disease_id: { in: diseaseIds } }
      });

      if (diseases.length !== diseaseIds.length) {
        throw new BadRequestException({
          status: false,
          message: 'One or more diseases do not exist'
        });
      }

      // Obtener enfermedades ya asignadas
      const existingDiseases = await this.prisma.users_diseases.findMany({
        where: {
          user_id: userId,
          disease_id: { in: diseaseIds },
          active: true
        },
        select: { disease_id: true }
      });

      const existingDiseaseIds = existingDiseases.map(d => d.disease_id);

      // Filtrar solo enfermedades nuevas
      const newDiseaseIds = diseaseIds.filter(id => !existingDiseaseIds.includes(id));

      if (newDiseaseIds.length === 0) {
        return {
          status: true,
          message: 'All diseases are already assigned to this user',
          count: 0
        };
      }

      // Crear nuevas relaciones
      const data = newDiseaseIds.map(diseaseId => ({
        user_id: userId,
        disease_id: diseaseId,
        modified_at: new Date()
      }));

      const result = await this.prisma.users_diseases.createMany({
        data,
        skipDuplicates: true
      });

      await this.cacheManager.del(`user_${userId}_diseases`);
      for (const diseaseId of newDiseaseIds) {
        await this.cacheManager.del(`disease_${diseaseId}_users`);
      }
      await this.cacheManager.del('users_diseases_*');

      return {
        status: true,
        message: 'Diseases assigned to user successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error assigning diseases to user', error);
      throw new BadRequestException({
        status: false,
        message: 'Error assigning diseases to user'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.users_diseasesWhereUniqueInput;
    where?: Prisma.users_diseasesWhereInput;
    orderBy?: Prisma.users_diseasesOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `users_diseases_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: number };

    const [result, total] = await Promise.all([
      this.prisma.users_diseases.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          diseases: {
            select: {
              disease_id: true,
              name: true,
            }
          },
          users: {
            select: {
              name: true,
              paternal_last_name: true,
              mother_last_name: true,
            }
          }
        }
      }),
      this.prisma.users_diseases.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.user_disease_id;
    }

    const response = {
      status: true,
      data: result,
      total,
      nextCursor
    };

    await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora

    return response;
  }

  async findOne(id: number): Promise<{ status: boolean, data: any }> {
    const cacheKey = `user_disease_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any };

    const userDisease = await this.prisma.users_diseases.findUnique({
      where: { user_disease_id: id },
      include: {
        diseases: {
          select: {
            disease_id: true,
            name: true,
            description: true
          }
        },
        users: {
          select: {
            user_id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!userDisease) throw new NotFoundException({ status: false, message: `User disease with ID ${id} not found` });

    const result = { status: true, data: userDisease };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByUserId(userId: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `user_${userId}_diseases`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        users_diseases: {
          include: {
            diseases: true,
            users: true
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
    }

    const userDiseases = await this.prisma.users_diseases.findMany({
      where: {
        user_id: userId,
        active: true
      },
      include: {
        diseases: {
          select: {
            disease_id: true,
            name: true,
            description: true
          }
        },
      }
    });

    const result = {
      status: true,
      data: userDiseases.map(ud => ({
        user_disease_id: ud.user_disease_id,
        user_id: ud.user_id,
        disease_id: ud.disease_id,
        disease: ud.diseases
      }))
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByDiseaseId(diseaseId: number): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `disease_${diseaseId}_users`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    const disease = await this.prisma.diseases.findUnique({
      where: { disease_id: diseaseId }
    });

    if (!disease) {
      throw new NotFoundException({ status: false, message: `Disease with ID ${diseaseId} not found` });
    }

    const diseaseUsers = await this.prisma.users_diseases.findMany({
      where: {
        disease_id: diseaseId,
        active: true
      },
      include: {
        users: {
          select: {
            user_id: true,
            name: true,
            paternal_last_name: true,
            mother_last_name: true,
            email: true
          }
        }
      }
    });

    const result = {
      status: true,
      data: diseaseUsers.map(du => ({
        user_disease_id: du.user_disease_id,
        user_id: du.user_id,
        disease_id: du.disease_id,
        user: du.users
      }))
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async update(id: number, updateUserDiseaseDto: Prisma.users_diseasesUpdateInput): Promise<{ status: boolean, data: any }> {
    const userDisease = await this.prisma.users_diseases.findUnique({
      where: { user_disease_id: id }
    });

    if (!userDisease) {
      throw new NotFoundException({ status: false, message: `User disease with ID ${id} not found` });
    }

    const updatedUserDisease = await this.prisma.users_diseases.update({
      where: { user_disease_id: id },
      data: {
        ...updateUserDiseaseDto,
        modified_at: new Date()
      },
      include: {
        diseases: {
          select: {
            disease_id: true,
            name: true,
            description: true
          }
        },
        users: {
          select: {
            user_id: true,
            name: true,
            email: true
          }
        }
      }
    });

    await this.cacheManager.del(`user_disease_${id}`);
    await this.cacheManager.del(`user_${userDisease.user_id}_diseases`);
    if (userDisease.disease_id) {
      await this.cacheManager.del(`disease_${userDisease.disease_id}_users`);
    }
    await this.cacheManager.del(`users_diseases_*`);

    return { status: true, data: updatedUserDisease };
  }

  async softDelete(id: number): Promise<{ status: boolean, message: string }> {
    try {
      const userDisease = await this.prisma.users_diseases.findUnique({
        where: { user_disease_id: id }
      });

      if (!userDisease) {
        throw new NotFoundException({ status: false, message: `User disease with ID ${id} not found` });
      }

      await this.prisma.users_diseases.update({
        where: { user_disease_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_disease_${id}`);
      await this.cacheManager.del(`user_${userDisease.user_id}_diseases`);
      if (userDisease.disease_id) {
        await this.cacheManager.del(`disease_${userDisease.disease_id}_users`);
      }
      await this.cacheManager.del(`users_diseases_*`);

      return { status: true, message: 'User disease deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user disease', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user disease' });
    }
  }

  async removeByUserId(userId: string): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }

      // Obtener todas las enfermedades asignadas al usuario para invalidar caché
      const userDiseases = await this.prisma.users_diseases.findMany({
        where: { user_id: userId, active: true },
        select: { disease_id: true }
      });

      const result = await this.prisma.users_diseases.updateMany({
        where: { user_id: userId, active: true },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_${userId}_diseases`);
      for (const ud of userDiseases) {
        if (ud.disease_id) {
          await this.cacheManager.del(`disease_${ud.disease_id}_users`);
        }
      }
      await this.cacheManager.del(`users_diseases_*`);

      return {
        status: true,
        message: 'User diseases deleted successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user diseases', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user diseases' });
    }
  }

  async removeByUserAndDisease(userId: string, diseaseId: number): Promise<{ status: boolean, message: string }> {
    try {
      const userDisease = await this.prisma.users_diseases.findFirst({
        where: {
          user_id: userId,
          disease_id: diseaseId,
          active: true
        }
      });

      if (!userDisease) {
        throw new NotFoundException({
          status: false,
          message: `User disease with user ID ${userId} and disease ID ${diseaseId} not found`
        });
      }

      await this.prisma.users_diseases.update({
        where: { user_disease_id: userDisease.user_disease_id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_disease_${userDisease.user_disease_id}`);
      await this.cacheManager.del(`user_${userId}_diseases`);
      await this.cacheManager.del(`disease_${diseaseId}_users`);
      await this.cacheManager.del(`users_diseases_*`);

      return { status: true, message: 'User disease deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user disease', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user disease' });
    }
  }
} 