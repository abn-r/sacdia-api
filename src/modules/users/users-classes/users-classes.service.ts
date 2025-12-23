import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersClassesService {
  private readonly logger = new Logger(UsersClassesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserClassDto: Prisma.users_classesUncheckedCreateInput) {
    if (!createUserClassDto.user_id || !createUserClassDto.class_id) {
      throw new BadRequestException({ status: false, message: 'User ID and Class ID are required' });
    }
    // Verificar que el usuario y la clase existen en una sola consulta
    const [user, classEntity] = await Promise.all([
      this.prisma.users.findUnique({
        where: { user_id: createUserClassDto.user_id as string }
      }),
      this.prisma.classes.findUnique({
        where: { class_id: createUserClassDto.class_id as number }
      })
    ]);

    if (!user)
      throw new NotFoundException({ status: false, message: `User with ID ${createUserClassDto.user_id} not found` });

    if (!classEntity)
      throw new NotFoundException({ status: false, message: `Class with ID ${createUserClassDto.class_id} not found` });

    // Verificar si ya existe la relación
    const existingUserClass = await this.prisma.users_classes.findFirst({
      where: {
        user_id: createUserClassDto.user_id as string,
        class_id: createUserClassDto.class_id as number,
        active: true
      }
    });

    if (existingUserClass) {
      throw new ConflictException({ status: false, message: 'User is already associated with this class' });
    }

    try {
      await this.prisma.users_classes.create({
        data: {
          user_id: createUserClassDto.user_id as string,
          class_id: createUserClassDto.class_id as number,
          investiture: false,
        }
      });

      await this.cacheManager.del(`user_${createUserClassDto.user_id}_classes`);
      await this.cacheManager.del(`class_${createUserClassDto.class_id}_users`);

      return {
        status: true,
        message: 'User class association created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating user class association', error);
      throw new BadRequestException({ status: false, message: 'Error creating user class association', error: error.message });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.users_classesWhereUniqueInput;
    where?: Prisma.users_classesWhereInput;
    orderBy?: Prisma.users_classesOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `users_classes_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: number };

    try {
      const [result, total] = await Promise.all([
        this.prisma.users_classes.findMany({
          skip,
          take: take ? take + 1 : undefined,
          cursor,
          where: { ...where, active: true },
          orderBy: orderBy || { user_class_id: 'asc' },
          select: {
            user_class_id: true,
            user_id: true,
            class_id: true,
            investiture: true,
            date_investiture: true,
            active: true
          }
        }),
        this.prisma.users_classes.count({
          where: { active: true }
        })
      ]);

      let nextCursor = undefined;
      if (take && result.length > take) {
        const nextItem = result.pop();
        nextCursor = nextItem.user_class_id;
      }

      const response = {
        status: true,
        data: result,
        total,
        nextCursor
      };

      await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora

      return response;

    } catch (error) {
      this.logger.error('Error retrieving user class associations', error);
      throw new BadRequestException({ status: false, message: 'Error retrieving user class associations' });
    }
  }

  async findOne(id: number) {
    const cacheKey = `user_class_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult;

    const userClass = await this.prisma.users_classes.findUnique({
      where: { user_class_id: id },
      select: {
        user_class_id: true,
        user_id: true,
        class_id: true,
        investiture: true,
        date_investiture: true,
        active: true
      }
    });

    if (!userClass || !userClass.active) {
      throw new NotFoundException({ status: false, message: `User class association with ID ${id} not found` });
    }

    const result = {
      status: true,
      data: userClass
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByUser(userId: string) {
    const cacheKey = `user_${userId}_classes`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult;

    // Verificar que el usuario existe
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
    }

    const userClasses = await this.prisma.users_classes.findMany({
      where: {
        user_id: userId,
        active: true
      },
      select: {
        user_class_id: true,
        user_id: true,
        class_id: true,
        investiture: true,
        advanced: true,
        date_investiture: true,
        classes: {
          select: {
            name: true,
            club_types: {
              select: {
                ct_id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const transformedData = userClasses.map(item => ({
      user_class_id: item.user_class_id,
      user_id: item.user_id,
      class_id: item.class_id,
      investiture: item.investiture,
      advanced: item.advanced,
      date_investiture: item.date_investiture,
      class_name: item.classes?.name || null,
      club_type_id: item.classes?.club_types?.ct_id || null,
      club_type_name: item.classes?.club_types?.name || null
    }));

    const result = {
      status: true,
      data: transformedData,
      total: transformedData.length
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByClass(classId: number) {
    const cacheKey = `class_${classId}_users`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult;

    // Verificar que la clase existe
    const classEntity = await this.prisma.classes.findUnique({
      where: { class_id: classId }
    });

    if (!classEntity) {
      throw new NotFoundException({ status: false, message: `Class with ID ${classId} not found` });
    }

    const userClasses = await this.prisma.users_classes.findMany({
      where: {
        class_id: classId,
        active: true
      },
      select: {
        user_class_id: true,
        user_id: true,
        class_id: true,
        investiture: true,
        date_investiture: true
      }
    });

    const result = {
      status: true,
      data: userClasses,
      total: userClasses.length
    };

    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async update(id: number, updateUserClassDto: Prisma.users_classesUpdateInput) {
    const existingUserClass = await this.prisma.users_classes.findUnique({
      where: { user_class_id: id }
    });

    if (!existingUserClass || !existingUserClass.active) {
      throw new NotFoundException({ status: false, message: `User class association with ID ${id} not found` });
    }

    try {
      const updated = await this.prisma.users_classes.update({
        where: { user_class_id: id },
        data: {
          ...updateUserClassDto,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_class_${id}`);
      await this.cacheManager.del(`user_${existingUserClass.user_id}_classes`);
      await this.cacheManager.del(`class_${existingUserClass.class_id}_users`);
      
      return {
        status: true,
        message: 'User class association updated successfully',
        data: updated
      };
    } catch (error) {
      this.logger.error('Error updating user class association', error);
      throw new BadRequestException({ status: false, message: 'Error updating user class association', error: error.message });
    }
  }

  async softDelete(id: number) {
    const existingUserClass = await this.prisma.users_classes.findUnique({
      where: { user_class_id: id }
    });

    if (!existingUserClass || !existingUserClass.active) {
      throw new NotFoundException({ status: false, message: `User class association with ID ${id} not found` });
    }

    try {
      await this.prisma.users_classes.update({
        where: { user_class_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_class_${id}`);
      await this.cacheManager.del(`user_${existingUserClass.user_id}_classes`);
      await this.cacheManager.del(`class_${existingUserClass.class_id}_users`);

      return {
        status: true,
        message: 'User class association deleted successfully'
      };
    } catch (error) {
      this.logger.error('Error deleting user class association', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user class association', error: error.message });
    }
  }

  async deleteByUserAndClass(userId: string, classId: number) {
    const existingUserClass = await this.prisma.users_classes.findFirst({
      where: {
        user_id: userId,
        class_id: classId,
        active: true
      }
    });

    if (!existingUserClass) {
      throw new NotFoundException({ status: false, message: `User class association for user ${userId} and class ${classId} not found` });
    }

    return this.softDelete(existingUserClass.user_class_id);
  }
} 