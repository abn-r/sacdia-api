import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RolePermissions } from './role-permissions.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RolePermissionsService {
  private readonly logger = new Logger(RolePermissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createRolePermissionDto: Prisma.role_permissionsCreateInput) {
    if (!createRolePermissionDto.roles || !createRolePermissionDto.permissions)
      throw new BadRequestException({ status: false, message: 'Role and permission are required' });

    const roleId = (createRolePermissionDto.roles as any).connect?.role_id;
    const permissionId = (createRolePermissionDto.permissions as any).connect?.permission_id;

    if (!roleId || !permissionId)
      throw new BadRequestException({ status: false, message: 'Valid role and permission IDs are required' });

    try {
      // Verificar si ya existe esta relación
      const existingRelation = await this.prisma.role_permissions.findFirst({
        where: {
          role_id: roleId,
          permission_id: permissionId,
          active: true
        }
      });

      if (existingRelation) {
        throw new ConflictException({ 
          status: false, 
          message: 'This permission is already assigned to this role' 
        });
      }

      await this.prisma.role_permissions.create({
        data: createRolePermissionDto,
      });

      await this.cacheManager.del(`role_permissions_*`);
      await this.cacheManager.del(`role_${roleId}_permissions`);

      return { status: true, message: 'Role permission created successfully' };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      
      this.logger.error('Error to create role permission, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create role permission, invalid data' });
    }
  }

  async createMany(rolePermissions: Prisma.role_permissionsUncheckedCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      const result = await this.prisma.role_permissions.createMany({
        data: rolePermissions,
        skipDuplicates: true,
      });

      const uniqueRoleIds = [...new Set(rolePermissions.map(rp => rp.role_id))];
      
      // Invalidar caché para cada rol afectado
      for (const roleId of uniqueRoleIds) {
        await this.cacheManager.del(`role_${roleId}_permissions`);
      }
      
      await this.cacheManager.del('role_permissions_*');

      return {
        status: true,
        message: 'Role permissions created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple role permissions', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating role permissions'
      });
    }
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el rol existe
      const role = await this.prisma.roles.findUnique({ where: { role_id: roleId } });
      if (!role) {
        throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
      }
      
      // Verificar que los permisos existen
      const permissions = await this.prisma.permissions.findMany({
        where: { permission_id: { in: permissionIds } }
      });
      
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException({ 
          status: false, 
          message: 'One or more permissions do not exist' 
        });
      }

      // Obtener permisos ya asignados
      const existingPermissions = await this.prisma.role_permissions.findMany({
        where: {
          role_id: roleId,
          permission_id: { in: permissionIds },
          active: true
        },
        select: { permission_id: true }
      });
      
      const existingPermissionIds = existingPermissions.map(p => p.permission_id);
      
      // Filtrar solo permisos nuevos
      const newPermissionIds = permissionIds.filter(id => !existingPermissionIds.includes(id));
      
      if (newPermissionIds.length === 0) {
        return {
          status: true,
          message: 'All permissions are already assigned to this role',
          count: 0
        };
      }
      
      // Crear nuevas relaciones
      const data = newPermissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));
      
      const result = await this.prisma.role_permissions.createMany({
        data,
        skipDuplicates: true
      });
      
      await this.cacheManager.del(`role_${roleId}_permissions`);
      await this.cacheManager.del('role_permissions_*');
      
      return {
        status: true,
        message: 'Permissions assigned to role successfully',
        count: result.count
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error('Error assigning permissions to role', error);
      throw new BadRequestException({
        status: false,
        message: 'Error assigning permissions to role'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.role_permissionsWhereUniqueInput;
    where?: Prisma.role_permissionsWhereInput;
    orderBy?: Prisma.role_permissionsOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: string }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `role_permissions_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: string };

    const [result, total] = await Promise.all([
      this.prisma.role_permissions.findMany({
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
          permissions: {
            select: {
              permission_id: true,
              permission_name: true,
              description: true
            }
          }
        }
      }),
      this.prisma.role_permissions.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.role_permission_id;
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
    const cacheKey = `role_permission_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any };

    const rolePermission = await this.prisma.role_permissions.findUnique({
      where: { role_permission_id: id },
      include: {
        roles: {
          select: {
            role_id: true,
            role_name: true
          }
        },
        permissions: {
          select: {
            permission_id: true,
            permission_name: true,
            description: true
          }
        }
      }
    });

    if (!rolePermission) throw new NotFoundException({ status: false, message: `Role permission with ID ${id} not found` });

    const result = { status: true, data: rolePermission };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByRoleId(roleId: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `role_${roleId}_permissions`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el rol existe
    const role = await this.prisma.roles.findUnique({ 
      where: { role_id: roleId } 
    });
    
    if (!role) {
      throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
    }

    const rolePermissions = await this.prisma.role_permissions.findMany({
      where: { 
        role_id: roleId,
        active: true 
      },
      include: {
        permissions: {
          select: {
            permission_id: true,
            permission_name: true,
            description: true
          }
        }
      }
    });

    const result = { 
      status: true, 
      data: rolePermissions.map(rp => ({
        role_permission_id: rp.role_permission_id,
        role_id: rp.role_id,
        permission_id: rp.permission_id,
        permission: rp.permissions
      }))
    };
    
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async update(id: string, updateRolePermissionDto: Prisma.role_permissionsUpdateInput): Promise<{ status: boolean, data: any }> {
    await this.findOne(id);

    const updatedRolePermission = await this.prisma.role_permissions.update({
      where: { role_permission_id: id },
      data: {
        ...updateRolePermissionDto,
        modified_at: new Date()
      },
      include: {
        roles: {
          select: {
            role_id: true,
            role_name: true
          }
        },
        permissions: {
          select: {
            permission_id: true,
            permission_name: true,
            description: true
          }
        }
      }
    });

    await this.cacheManager.del(`role_permission_${id}`);
    await this.cacheManager.del(`role_${updatedRolePermission.role_id}_permissions`);
    await this.cacheManager.del(`role_permissions_*`);

    return { status: true, data: updatedRolePermission };
  }

  async softDelete(id: string): Promise<{ status: boolean, message: string }> {
    try {
      const rolePermission = await this.prisma.role_permissions.findUnique({
        where: { role_permission_id: id }
      });

      if (!rolePermission) {
        throw new NotFoundException({ status: false, message: `Role permission with ID ${id} not found` });
      }

      await this.prisma.role_permissions.update({
        where: { role_permission_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`role_permission_${id}`);
      await this.cacheManager.del(`role_${rolePermission.role_id}_permissions`);
      await this.cacheManager.del(`role_permissions_*`);

      return { status: true, message: 'Role permission deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting role permission', error);
      throw new BadRequestException({ status: false, message: 'Error deleting role permission' });
    }
  }

  async removeByRoleId(roleId: string): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Verificar que el rol existe
      const role = await this.prisma.roles.findUnique({ where: { role_id: roleId } });
      if (!role) {
        throw new NotFoundException({ status: false, message: `Role with ID ${roleId} not found` });
      }

      const result = await this.prisma.role_permissions.updateMany({
        where: { role_id: roleId, active: true },
        data: { 
          active: false,
          modified_at: new Date() 
        }
      });

      await this.cacheManager.del(`role_${roleId}_permissions`);
      await this.cacheManager.del(`role_permissions_*`);

      return { 
        status: true, 
        message: 'Role permissions deleted successfully', 
        count: result.count 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting role permissions', error);
      throw new BadRequestException({ status: false, message: 'Error deleting role permissions' });
    }
  }

  async removeByRoleAndPermission(roleId: string, permissionId: string): Promise<{ status: boolean, message: string }> {
    try {
      const rolePermission = await this.prisma.role_permissions.findFirst({
        where: {
          role_id: roleId,
          permission_id: permissionId,
          active: true
        }
      });

      if (!rolePermission) {
        throw new NotFoundException({ 
          status: false, 
          message: `Role permission with role ID ${roleId} and permission ID ${permissionId} not found` 
        });
      }

      await this.prisma.role_permissions.update({
        where: { role_permission_id: rolePermission.role_permission_id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`role_permission_${rolePermission.role_permission_id}`);
      await this.cacheManager.del(`role_${roleId}_permissions`);
      await this.cacheManager.del(`role_permissions_*`);

      return { status: true, message: 'Role permission deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting role permission', error);
      throw new BadRequestException({ status: false, message: 'Error deleting role permission' });
    }
  }
} 