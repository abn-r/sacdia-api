import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Roles } from './roles.model';

type CreateRoleDto = Prisma.rolesCreateInput;
type UpdateRoleDto = Prisma.rolesUpdateInput;

/**
 * Roles service using GenericCrudService
 * Reduced from ~266 lines to ~110 lines
 */
@Injectable()
export class RolesService extends GenericCrudService<Roles, CreateRoleDto, UpdateRoleDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Role',
      idField: 'role_id',
      nameField: 'role_name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.roles;
  }

  protected getSelectFields() {
    return {
      role_id: true,
      role_name: true,
      role_category: true,
      active: true
    };
  }

  protected async validateCreate(dto: CreateRoleDto): Promise<void> {
    if (!dto.role_name) {
      throw new BadRequestException({ status: false, message: 'Role name is required' });
    }
    if (!dto.role_category) {
      throw new BadRequestException({ status: false, message: 'Role category is required' });
    }
  }

  protected async checkDuplicate(dto: CreateRoleDto | UpdateRoleDto, excludeId?: string): Promise<void> {
    const roleName = dto.role_name as string;
    if (!roleName) return;

    const existing = await this.prisma.roles.findFirst({
      where: {
        role_name: roleName,
        NOT: excludeId ? { role_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Role with this name and category already exists'
      });
    }
  }

  /**
   * Find the default 'user' role
   */
  async findUserRole(): Promise<{ status: boolean; data: { role_id: string } }> {
    const cacheKey = 'user_role_id';

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: { role_id: string } };
    }

    const userRole = await this.prisma.roles.findFirst({
      where: { role_name: 'user', active: true },
      select: { role_id: true }
    });

    if (!userRole) {
      throw new NotFoundException({ status: false, message: 'User role not found' });
    }

    const response = { status: true, data: { role_id: userRole.role_id } };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, response, this.cacheTTL);
    }

    return response;
  }

  async createMany(roles: CreateRoleDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.roles.createMany({
        data: roles as any,
        skipDuplicates: true
      });

      await this.invalidateCache();

      return {
        status: true,
        message: 'Roles created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple roles', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating roles'
      });
    }
  }
} 