import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UsersRoles } from './users-roles.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersRolesService {
  private readonly logger = new Logger(UsersRolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createUserRoleDto: Prisma.users_rolesCreateInput) {
    if (!createUserRoleDto.roles || !createUserRoleDto.users)
      throw new BadRequestException({ status: false, message: 'User and role are required' });

    const roleId = (createUserRoleDto.roles as any).connect?.role_id;
    const userId = (createUserRoleDto.users as any).connect?.user_id;

    if (!roleId || !userId)
      throw new BadRequestException({ status: false, message: 'Valid user and role IDs are required' });

    try {
      // Verificar si ya existe esta relación
      const existingRelation = await this.prisma.users_roles.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
          active: true
        }
      });

      if (existingRelation) {
        throw new ConflictException({ 
          status: false, 
          message: 'This role is already assigned to this user' 
        });
      }

      await this.prisma.users_roles.create({
        data: createUserRoleDto,
      });

      await this.cacheManager.del(`users_roles_*`);
      await this.cacheManager.del(`user_${userId}_roles`);
      await this.cacheManager.del(`role_${roleId}_users`);

      return { status: true, message: 'User role created successfully' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      
      this.logger.error('Error to create user role, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create user role, invalid data' });
    }
  }

  async createMany(userRoles: Prisma.users_rolesUncheckedCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      const result = await this.prisma.users_roles.createMany({
        data: userRoles,
        skipDuplicates: true,
      });

      const uniqueUserIds = [...new Set(userRoles.map(ur => ur.user_id))];
      const uniqueRoleIds = [...new Set(userRoles.map(ur => ur.role_id))];
      
      // Invalidar caché para cada usuario y rol afectado
      for (const userId of uniqueUserIds) {
        await this.cacheManager.del(`user_${userId}_roles`);
      }

      for (const roleId of uniqueRoleIds) {
        await this.cacheManager.del(`role_${roleId}_users`);
      }
      
      await this.cacheManager.del('users_roles_*');

      return {
        status: true,
        message: 'User roles created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple user roles', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating user roles'
      });
    }
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }
      
      // Verificar que los roles existen
      const roles = await this.prisma.roles.findMany({
        where: { role_id: { in: roleIds } }
      });
      
      if (roles.length !== roleIds.length) {
        throw new BadRequestException({ 
          status: false, 
          message: 'One or more roles do not exist' 
        });
      }

      // Obtener roles ya asignados
      const existingRoles = await this.prisma.users_roles.findMany({
        where: {
          user_id: userId,
          role_id: { in: roleIds },
          active: true
        },
        select: { role_id: true }
      });
      
      const existingRoleIds = existingRoles.map(r => r.role_id);
      
      // Filtrar solo roles nuevos
      const newRoleIds = roleIds.filter(id => !existingRoleIds.includes(id));
      
      if (newRoleIds.length === 0) {
        return {
          status: true,
          message: 'All roles are already assigned to this user',
          count: 0
        };
      }
      
      // Crear nuevas relaciones
      const data = newRoleIds.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }));
      
      const result = await this.prisma.users_roles.createMany({
        data,
        skipDuplicates: true
      });
      
      await this.cacheManager.del(`user_${userId}_roles`);
      for (const roleId of newRoleIds) {
        await this.cacheManager.del(`role_${roleId}_users`);
      }
      await this.cacheManager.del('users_roles_*');
      
      return {
        status: true,
        message: 'Roles assigned to user successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error('Error assigning roles to user', error);
      throw new BadRequestException({
        status: false,
        message: 'Error assigning roles to user'
      });
    }
  }

  async assignUsersToRole(roleId: string, userIds: string[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el rol existe
      const role = await this.prisma.roles.findUnique({ where: { role_id: roleId } });
      if (!role) {
        throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
      }
      
      // Verificar que los usuarios existen
      const users = await this.prisma.users.findMany({
        where: { user_id: { in: userIds } }
      });
      
      if (users.length !== userIds.length) {
        throw new BadRequestException({ 
          status: false, 
          message: 'One or more users do not exist' 
        });
      }

      // Obtener usuarios ya asignados
      const existingUsers = await this.prisma.users_roles.findMany({
        where: {
          role_id: roleId,
          user_id: { in: userIds },
          active: true
        },
        select: { user_id: true }
      });
      
      const existingUserIds = existingUsers.map(u => u.user_id);
      
      // Filtrar solo usuarios nuevos
      const newUserIds = userIds.filter(id => !existingUserIds.includes(id));
      
      if (newUserIds.length === 0) {
        return {
          status: true,
          message: 'All users are already assigned to this role',
          count: 0
        };
      }
      
      // Crear nuevas relaciones
      const data = newUserIds.map(userId => ({
        role_id: roleId,
        user_id: userId
      }));
      
      const result = await this.prisma.users_roles.createMany({
        data,
        skipDuplicates: true
      });
      
      await this.cacheManager.del(`role_${roleId}_users`);
      for (const userId of newUserIds) {
        await this.cacheManager.del(`user_${userId}_roles`);
      }
      await this.cacheManager.del('users_roles_*');
      
      return {
        status: true,
        message: 'Users assigned to role successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error('Error assigning users to role', error);
      throw new BadRequestException({
        status: false,
        message: 'Error assigning users to role'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.users_rolesWhereUniqueInput;
    where?: Prisma.users_rolesWhereInput;
    orderBy?: Prisma.users_rolesOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: string }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `users_roles_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: string };

    const [result, total] = await Promise.all([
      this.prisma.users_roles.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          roles: {
            select: {
              role_id: true,
              role_name: true
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
      }),
      this.prisma.users_roles.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.user_role_id;
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

  async findOne(id: string): Promise<{ status: boolean, data: any }> {
    const cacheKey = `user_role_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any };

    const userRole = await this.prisma.users_roles.findUnique({
      where: { user_role_id: id },
      include: {
        roles: {
          select: {
            role_id: true,
            role_name: true
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

    if (!userRole) throw new NotFoundException({ status: false, message: `User role with ID ${id} not found` });

    const result = { status: true, data: userRole };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByUserId(userId: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `user_${userId}_roles`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el usuario existe
    const user = await this.prisma.users.findUnique({ 
      where: { user_id: userId } 
    });
    
    if (!user) {
      throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
    }

    const userRoles = await this.prisma.users_roles.findMany({
      where: { 
        user_id: userId,
        active: true 
      },
      include: {
        roles: {
          select: {
            role_id: true,
            role_name: true
          }
        }
      }
    });

    const result = { 
      status: true, 
      data: userRoles.map(ur => ({
        user_role_id: ur.user_role_id,
        user_id: ur.user_id,
        role_id: ur.role_id,
        role: ur.roles.role_name
      }))
    };
    
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByRoleId(roleId: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `role_${roleId}_users`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el rol existe
    const role = await this.prisma.roles.findUnique({ 
      where: { role_id: roleId } 
    });
    
    if (!role) {
      throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
    }

    const roleUsers = await this.prisma.users_roles.findMany({
      where: { 
        role_id: roleId,
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
      data: roleUsers.map(ru => ({
        user_role_id: ru.user_role_id,
        user_id: ru.user_id,
        role_id: ru.role_id,
        user: ru.users
      }))
    };
    
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async update(id: string, updateUserRoleDto: Prisma.users_rolesUpdateInput): Promise<{ status: boolean, data: any }> {
    const userRole = await this.prisma.users_roles.findUnique({
      where: { user_role_id: id }
    });

    if (!userRole) {
      throw new NotFoundException({ status: false, message: `User role with ID ${id} not found` });
    }

    const updatedUserRole = await this.prisma.users_roles.update({
      where: { user_role_id: id },
      data: {
        ...updateUserRoleDto,
        modified_at: new Date()
      },
      include: {
        roles: {
          select: {
            role_id: true,
            role_name: true
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

    await this.cacheManager.del(`user_role_${id}`);
    await this.cacheManager.del(`user_${userRole.user_id}_roles`);
    await this.cacheManager.del(`role_${userRole.role_id}_users`);
    await this.cacheManager.del(`users_roles_*`);

    return { status: true, data: updatedUserRole };
  }

  async softDelete(id: string): Promise<{ status: boolean, message: string }> {
    try {
      const userRole = await this.prisma.users_roles.findUnique({
        where: { user_role_id: id }
      });

      if (!userRole) {
        throw new NotFoundException({ status: false, message: `User role with ID ${id} not found` });
      }

      await this.prisma.users_roles.update({
        where: { user_role_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_role_${id}`);
      await this.cacheManager.del(`user_${userRole.user_id}_roles`);
      await this.cacheManager.del(`role_${userRole.role_id}_users`);
      await this.cacheManager.del(`users_roles_*`);

      return { status: true, message: 'User role deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting user role', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user role' });
    }
  }

  async removeByUserId(userId: string): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }

      // Obtener todos los roles asignados al usuario para invalidar caché
      const userRoles = await this.prisma.users_roles.findMany({
        where: { user_id: userId, active: true },
        select: { role_id: true }
      });

      const result = await this.prisma.users_roles.updateMany({
        where: { user_id: userId, active: true },
        data: { 
          active: false,
          modified_at: new Date() 
        }
      });

      await this.cacheManager.del(`user_${userId}_roles`);
      for (const ur of userRoles) {
        await this.cacheManager.del(`role_${ur.role_id}_users`);
      }
      await this.cacheManager.del(`users_roles_*`);

      return { 
        status: true, 
        message: 'User roles deleted successfully', 
        count: result.count 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting user roles', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user roles' });
    }
  }

  async removeByRoleId(roleId: string): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el rol existe
      const role = await this.prisma.roles.findUnique({ where: { role_id: roleId } });
      if (!role) {
        throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
      }

      // Obtener todos los usuarios asignados al rol para invalidar caché
      const roleUsers = await this.prisma.users_roles.findMany({
        where: { role_id: roleId, active: true },
        select: { user_id: true }
      });

      const result = await this.prisma.users_roles.updateMany({
        where: { role_id: roleId, active: true },
        data: { 
          active: false,
          modified_at: new Date() 
        }
      });

      await this.cacheManager.del(`role_${roleId}_users`);
      for (const ru of roleUsers) {
        await this.cacheManager.del(`user_${ru.user_id}_roles`);
      }
      await this.cacheManager.del(`users_roles_*`);

      return { 
        status: true, 
        message: 'Role users deleted successfully', 
        count: result.count 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting role users', error);
      throw new BadRequestException({ status: false, message: 'Error deleting role users' });
    }
  }

  async removeByUserAndRole(userId: string, roleId: string): Promise<{ status: boolean, message: string }> {
    try {
      const userRole = await this.prisma.users_roles.findFirst({
        where: {
          user_id: userId,
          role_id: roleId,
          active: true
        }
      });

      if (!userRole) {
        throw new NotFoundException({ 
          status: false, 
          message: `User role with user ID ${userId} and role ID ${roleId} not found` 
        });
      }

      await this.prisma.users_roles.update({
        where: { user_role_id: userRole.user_role_id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`user_role_${userRole.user_role_id}`);
      await this.cacheManager.del(`user_${userId}_roles`);
      await this.cacheManager.del(`role_${roleId}_users`);
      await this.cacheManager.del(`users_roles_*`);

      return { status: true, message: 'User role deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting user role', error);
      throw new BadRequestException({ status: false, message: 'Error deleting user role' });
    }
  }
} 