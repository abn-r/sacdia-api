import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UsersAllergies } from './users-allergies.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersAllergiesService {
  private readonly logger = new Logger(UsersAllergiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserAllergyDto: Prisma.users_allergiesCreateInput) {
    if (!createUserAllergyDto.users || !createUserAllergyDto.allergies)
      throw new BadRequestException({ status: false, message: 'User and allergy are required' });

    const userId = (createUserAllergyDto.users as any).connect?.user_id;
    const allergyId = (createUserAllergyDto.allergies as any).connect?.allergy_id;

    if (!userId || !allergyId)
      throw new BadRequestException({ status: false, message: 'Valid user and allergy IDs are required' });

    try {
      const existingRelation = await this.prisma.users_allergies.findFirst({
        where: {
          user_id: userId,
          allergy_id: allergyId,
        }
      });

      if (existingRelation) {
        throw new ConflictException({
          status: false,
          message: 'This allergy is already assigned to this user'
        });
      }

      await this.prisma.users_allergies.create({
        data: createUserAllergyDto,
      });

      await this.cacheManager.del(`users_allergies_*`);
      await this.cacheManager.del(`user_${userId}_allergies`);
      await this.cacheManager.del(`allergy_${allergyId}_users`);

      return { status: true, message: 'User allergy created successfully' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      this.logger.error('Error to create user allergy, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create user allergy, invalid data' });
    }
  }

  async createMany(userAllergies: Prisma.users_allergiesUncheckedCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      const result = await this.prisma.users_allergies.createMany({
        data: userAllergies,
        skipDuplicates: true,
      });

      const uniqueUserIds = [...new Set(userAllergies.map(ua => ua.user_id))];
      const uniqueAllergyIds = [...new Set(userAllergies.map(ua => ua.allergy_id))];

      // Invalidar caché para cada usuario y alergia afectada
      for (const userId of uniqueUserIds) {
        await this.cacheManager.del(`user_${userId}_allergies`);
      }

      for (const allergyId of uniqueAllergyIds) {
        if (allergyId) {
          await this.cacheManager.del(`allergy_${allergyId}_users`);
        }
      }

      await this.cacheManager.del('users_allergies_*');

      return {
        status: true,
        message: 'User allergies created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple user allergies', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating user allergies'
      });
    }
  }

  async assignAllergiesToUser(userId: string, allergyIds: number[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }

      // Verificar que las alergias existen
      const allergies = await this.prisma.allergies.findMany({
        where: { allergy_id: { in: allergyIds } }
      });

      if (allergies.length !== allergyIds.length) {
        throw new BadRequestException({
          status: false,
          message: 'One or more allergies do not exist'
        });
      }

      // Obtener alergias ya asignadas
      const existingAllergies = await this.prisma.users_allergies.findMany({
        where: {
          user_id: userId,
          allergy_id: { in: allergyIds },
          active: true
        },
        select: { allergy_id: true }
      });

      const existingAllergyIds = existingAllergies.map(a => a.allergy_id);

      // Filtrar solo alergias nuevas
      const newAllergyIds = allergyIds.filter(id => !existingAllergyIds.includes(id));

      if (newAllergyIds.length === 0) {
        return {
          status: true,
          message: 'All allergies are already assigned to this user',
          count: 0
        };
      }

      // Crear nuevas relaciones
      const data = newAllergyIds.map(allergyId => ({
        user_id: userId,
        allergy_id: allergyId
      }));

      const result = await this.prisma.users_allergies.createMany({
        data: data,
        skipDuplicates: true
      });

      await this.cacheManager.del(`user_${userId}_allergies`);
      for (const allergyId of newAllergyIds) {
        await this.cacheManager.del(`allergy_${allergyId}_users`);
      }
      await this.cacheManager.del('users_allergies_*');

      return {
        status: true,
        message: 'Allergies assigned to user successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error assigning allergies to user', error);
      throw new BadRequestException({
        status: false,
        message: 'Error assigning allergies to user'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.users_allergiesWhereUniqueInput;
    where?: Prisma.users_allergiesWhereInput;
    orderBy?: Prisma.users_allergiesOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `users_allergies_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: number };

    const [result, total] = await Promise.all([
      this.prisma.users_allergies.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          allergies: {
            select: {
              allergy_id: true,
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
      this.prisma.users_allergies.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.user_allergies_id;
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
    const cacheKey = `user_allergy_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any };

    const userAllergy = await this.prisma.users_allergies.findUnique({
      where: { user_allergies_id: id },
      include: {
        allergies: {
          select: {
            allergy_id: true,
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

    if (!userAllergy) throw new NotFoundException({ status: false, message: `User allergy with ID ${id} not found` });

    const result = { status: true, data: userAllergy };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByUserId(userId: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `user_${userId}_allergies`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        users_allergies: {
          include: {
            allergies: true,
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

    const userAllergies = await this.prisma.users_allergies.findMany({
      where: {
        user_id: userId,
        active: true
      },
      include: {
        allergies: {
          select: {
            allergy_id: true,
            name: true,
            description: true
          }
        },
      }
    });

    const result = {
      status: true,
      data: userAllergies.map(ua => ({
        user_allergies_id: ua.user_allergies_id,
        user_id: ua.user_id, // TODO: Consider removing this field
        allergy_id: ua.allergy_id,
        allergy: ua.allergies
      }))
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByAllergyId(allergyId: number): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `allergy_${allergyId}_users`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    const allergy = await this.prisma.allergies.findUnique({
      where: { allergy_id: allergyId }
    });

    if (!allergy) {
      throw new NotFoundException({ status: false, message: `Allergy with ID ${allergyId} not found` });
    }

    const allergyUsers = await this.prisma.users_allergies.findMany({
      where: {
        allergy_id: allergyId,
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
      data: allergyUsers.map(au => ({
        user_allergies_id: au.user_allergies_id,
        user_id: au.user_id,
        allergy_id: au.allergy_id,
        user: au.users
      }))
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async update(id: number, updateUserAllergyDto: Prisma.users_allergiesUpdateInput): Promise<{ status: boolean, data: any }> {
    const userAllergy = await this.prisma.users_allergies.findUnique({
      where: { user_allergies_id: id }
    });

    if (!userAllergy) {
      throw new NotFoundException({ status: false, message: `User allergy with ID ${id} not found` });
    }

    const updatedUserAllergy = await this.prisma.users_allergies.update({
      where: { user_allergies_id: id },
      data: {
        ...updateUserAllergyDto,
        modified_at: new Date()
      },
      include: {
        allergies: {
          select: {
            allergy_id: true,
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

    await this.cacheManager.del(`user_allergy_${id}`);
    await this.cacheManager.del(`user_${userAllergy.user_id}_allergies`);
    if (userAllergy.allergy_id) {
      await this.cacheManager.del(`allergy_${userAllergy.allergy_id}_users`);
    }
    await this.cacheManager.del(`users_allergies_*`);

    return { status: true, data: updatedUserAllergy };
  }

  async softDelete(id: number): Promise<{ status: boolean, message: string }> {
    try {
      const userAllergy = await this.prisma.users_allergies.findUnique({
        where: { user_allergies_id: id }
      });

      if (!userAllergy) {
        throw new NotFoundException({ status: false, message: `User allergy with ID ${id} not found` });
      }

      await this.prisma.users_allergies.update({
        where: { user_allergies_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_allergy_${id}`);
      await this.cacheManager.del(`user_${userAllergy.user_id}_allergies`);
      if (userAllergy.allergy_id) {
        await this.cacheManager.del(`allergy_${userAllergy.allergy_id}_users`);
      }
      await this.cacheManager.del(`users_allergies_*`);

      return { status: true, message: 'User allergy deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user allergy', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user allergy' });
    }
  }

  async removeByUserId(userId: string): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }

      // Obtener todas las alergias asignadas al usuario para invalidar caché
      const userAllergies = await this.prisma.users_allergies.findMany({
        where: { user_id: userId, active: true },
        select: { allergy_id: true }
      });

      const result = await this.prisma.users_allergies.updateMany({
        where: { user_id: userId, active: true },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_${userId}_allergies`);
      for (const ua of userAllergies) {
        if (ua.allergy_id) {
          await this.cacheManager.del(`allergy_${ua.allergy_id}_users`);
        }
      }
      await this.cacheManager.del(`users_allergies_*`);

      return {
        status: true,
        message: 'User allergies deleted successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user allergies', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user allergies' });
    }
  }

  async removeByUserAndAllergy(userId: string, allergyId: number): Promise<{ status: boolean, message: string }> {
    try {
      const userAllergy = await this.prisma.users_allergies.findFirst({
        where: {
          user_id: userId,
          allergy_id: allergyId,
          active: true
        }
      });

      if (!userAllergy) {
        throw new NotFoundException({
          status: false,
          message: `User allergy with user ID ${userId} and allergy ID ${allergyId} not found`
        });
      }

      await this.prisma.users_allergies.update({
        where: { user_allergies_id: userAllergy.user_allergies_id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_allergy_${userAllergy.user_allergies_id}`);
      await this.cacheManager.del(`user_${userId}_allergies`);
      await this.cacheManager.del(`allergy_${allergyId}_users`);
      await this.cacheManager.del(`users_allergies_*`);

      return { status: true, message: 'User allergy deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error('Error deleting user allergy', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user allergy' });
    }
  }
} 