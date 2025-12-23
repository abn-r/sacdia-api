import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Permissions } from './permissions.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AssignPermissionsToRolesDto } from './models/assign-permissions-to-roles.dto'; // Import the DTO

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createPermissionDto: Prisma.permissionsCreateInput) {
    if (!createPermissionDto.permission_name)
      throw new BadRequestException({ status: false, message: 'Permission name is required' });

    const existingPermission = await this.prisma.permissions.findFirst({
      where: {
        permission_name: createPermissionDto.permission_name
      }
    });

    if (existingPermission) 
      throw new ConflictException({ status: false, message: 'Permission with this name already exists' });

    try {
      const permissionData: Prisma.permissionsCreateInput = {
        permission_name: createPermissionDto.permission_name,
        description: createPermissionDto.description,
        active: createPermissionDto.active !== undefined ? createPermissionDto.active : true
      };

      await this.prisma.permissions.create({
        data: permissionData,
      });

      await this.cacheManager.del(`permissions_list_*`);
      await this.cacheManager.del('all_permissions_names'); // Invalidate all names cache

      return { status: true, message: 'Permission created successfully' };
    } catch (error) {
      this.logger.error('Error to create permission, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create permission, invalid data' });
    }
  }

  async createMany(permissions: Prisma.permissionsCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      const result = await this.prisma.permissions.createMany({
        data: permissions,
        skipDuplicates: true,
      });

      await this.cacheManager.del('permissions_list_*');
      await this.cacheManager.del('all_permissions_names'); // Invalidate all names cache

      return {
        status: true,
        message: 'Permissions created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple permissions', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating permissions'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.permissionsWhereUniqueInput;
    where?: Prisma.permissionsWhereInput;
    orderBy?: Prisma.permissionsOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: Permissions[], total: number, nextCursor?: string }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `permissions_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: Permissions[], total: number, nextCursor?: string };

    const [result, total] = await Promise.all([
      this.prisma.permissions.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { permission_name: 'asc' },
        select: {
          permission_id: true,
          permission_name: true,
          description: true
        }
      }),
      this.prisma.permissions.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.permission_id;
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

  async findOne(id: string): Promise<{ status: boolean, data: Permissions }> {
    const cacheKey = `permission_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: Permissions };

    const permission = await this.prisma.permissions.findUnique({
      where: { permission_id: id },
      select: {
        permission_id: true,
        permission_name: true,
        description: true
      }
    });

    if (!permission) throw new NotFoundException({ status: false, message: `Permission with ID ${id} not found` });

    const result = { status: true, data: permission };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async search(term: string): Promise<{ status: boolean, data: Permissions[] }> {
    const cacheKey = `permissions_search_${term}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: Permissions[] };

    const results = await this.prisma.permissions.findMany({
      where: {
        OR: [
          { permission_name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } }
        ],
        AND: { active: true }
      },
      select: {
        permission_id: true,
        permission_name: true,
        description: true
      },
      take: 50
    });

    const response = { status: true, data: results };
    await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora

    return response;
  }

  async update(id: string, updatePermissionDto: Prisma.permissionsUpdateInput): Promise<{ status: boolean, data: Permissions }> {
    await this.findOne(id);

    if (updatePermissionDto.permission_name) {
      const existingPermission = await this.prisma.permissions.findFirst({
        where: {
          permission_name: updatePermissionDto.permission_name as string,
          NOT: { permission_id: id }
        }
      });

      if (existingPermission)
        throw new ConflictException({ status: false, message: 'Permission with this name already exists' });
    }

    const updatedPermission = await this.prisma.permissions.update({
      where: { permission_id: id },
      data: {
        ...updatePermissionDto,
        modified_at: new Date
      },
      select: {
        permission_id: true,
        permission_name: true,
        description: true
      }
    });

    await this.cacheManager.del(`permission_${id}`);
    await this.cacheManager.del(`permissions_list_*`);
    await this.cacheManager.del('all_permissions_names'); // Invalidate all names cache
    await this.cacheManager.del('role_permissions_*'); // Invalidate role permissions cache

    return { status: true, data: updatedPermission };
  }

  async softDelete(id: string): Promise<{ status: boolean, message: string }> {
    try {
       // Check if permission exists first
       const permission = await this.prisma.permissions.findUnique({
        where: { permission_id: id },
        select: { permission_id: true } // Only need ID to check existence
      });

      if (!permission) {
        throw new NotFoundException({ status: false, message: `Permission with ID ${id} not found` });
      }

      await this.prisma.$transaction(async (tx) => {
        // Soft delete the permission
        await tx.permissions.update({
          where: { permission_id: id },
          data: {
            active: false,
            modified_at: new Date()
          }
        });

        // Optionally: deactivate related role_permissions entries
        await tx.role_permissions.updateMany({
          where: { permission_id: id },
          data: { active: false }
        });
      });

      await this.cacheManager.del(`permission_${id}`);
      await this.cacheManager.del(`permissions_list_*`);
      await this.cacheManager.del('all_permissions_names'); // Invalidate all names cache
      await this.cacheManager.del('role_permissions_*'); // Invalidate role permissions cache

      return { status: true, message: 'Permission soft deleted successfully' };
    } catch (error) {
       if (error instanceof NotFoundException) {
         throw error;
       }
      this.logger.error(`Error soft deleting permission with ID ${id}`, error);
      throw new BadRequestException({ status: false, message: 'Error deleting permission' });
    }
  }

  /**
   * Creates permissions if they don't exist and assigns them to the specified roles.
   * Uses a transaction to ensure atomicity.
   * @param assignPermissionsDto DTO containing permissions to create/find and role IDs.
   * @returns Object indicating success and details of assignments.
   */
  async assignPermissionsToRoles(assignPermissionsDto: AssignPermissionsToRolesDto): Promise<{ status: boolean; message: string; assigned: any[] }> {
    const { permissions: permissionInputs, roleIds } = assignPermissionsDto;

    if (!permissionInputs || permissionInputs.length === 0) {
      throw new BadRequestException({ status: false, message: 'No permissions provided to assign.' });
    }
    if (!roleIds || roleIds.length === 0) {
      throw new BadRequestException({ status: false, message: 'No role IDs provided to assign permissions to.' });
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Verify all roles exist
        const roles = await tx.roles.findMany({
          where: { role_id: { in: roleIds }, active: true },
          select: { role_id: true, role_name: true }, // Select name for response
        });

        const foundRoleIds = roles.map(r => r.role_id);
        const notFoundRoleIds = roleIds.filter(id => !foundRoleIds.includes(id));

        if (notFoundRoleIds.length > 0) {
          this.logger.warn(`Roles not found or inactive: ${notFoundRoleIds.join(', ')}`);
          throw new NotFoundException({ status: false, message: `The following roles were not found or are inactive: ${notFoundRoleIds.join(', ')}` });
        }

        // 2. Upsert permissions (find or create)
        const permissionPromises = permissionInputs.map(pInput =>
          tx.permissions.upsert({
            where: { permission_name: pInput.permission_name },
            update: { description: pInput.description, active: true }, // Update description and ensure active
            create: {
              permission_name: pInput.permission_name,
              description: pInput.description,
              active: true,
            },
            select: { permission_id: true, permission_name: true }, // Select needed fields
          })
        );

        const upsertedPermissions = await Promise.all(permissionPromises);
        const permissionIds = upsertedPermissions.map(p => p.permission_id);

        // 3. Prepare data for role_permissions creation
        const rolePermissionData = roleIds.flatMap(roleId =>
          permissionIds.map(permissionId => ({
            role_id: roleId,
            permission_id: permissionId,
            active: true, // Ensure the link is active
          }))
        );

        // 4. Create role_permissions links, skipping duplicates
        const creationResult = await tx.role_permissions.createMany({
          data: rolePermissionData,
          skipDuplicates: true,
        });

        // 5. Prepare response data
        const assignedDetails = roles.map(role => ({
          roleId: role.role_id,
          roleName: role.role_name,
          permissionsAssigned: upsertedPermissions.map(p => p.permission_name),
        }));

        return { count: creationResult.count, assignedDetails };
      });

      // Invalidate relevant caches
      await this.cacheManager.del(`permissions_list_*`);
      await this.cacheManager.del('all_permissions_names');
      await this.cacheManager.del('role_permissions_*'); // General invalidation for role permissions
      roleIds.forEach(roleId => {
        this.cacheManager.del(`role_permissions_role_${roleId}`); // Specific role permission cache
        this.cacheManager.del(`role_permissions_role_${roleId}_names`); // Specific role permission name cache
      });

      this.logger.log(`${result.count} new role-permission links created.`);

      return {
        status: true,
        message: `Successfully assigned permissions to roles. ${result.count} new assignments created.`,
        assigned: result.assignedDetails,
      };
    } catch (error) {
      this.logger.error('Error assigning permissions to roles:', error.message, error.stack);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Re-throw specific exceptions
      }
      throw new BadRequestException({ status: false, message: 'An error occurred while assigning permissions.' });
    }
  }

  /**
   * Retrieves all active permission names, useful for frontend selections or validation.
   * Caches the result.
   * @returns A list of active permission names.
   */
  async getAllPermissionNames(): Promise<{ status: boolean, data: string[] }> {
    const cacheKey = 'all_permissions_names';
    const cachedResult = await this.cacheManager.get<string[]>(cacheKey);

    if (cachedResult) {
      return { status: true, data: cachedResult };
    }

    const permissions = await this.prisma.permissions.findMany({
      where: { active: true },
      select: { permission_name: true },
      orderBy: { permission_name: 'asc' },
    });

    const names = permissions.map(p => p.permission_name);
    await this.cacheManager.set(cacheKey, names, 3600000); // Cache for 1 hour

    return { status: true, data: names };
  }
} 