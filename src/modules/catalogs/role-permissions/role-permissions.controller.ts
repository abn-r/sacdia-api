import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { RolePermissions } from './role-permissions.model';
import { RolePermissionsService } from './role-permissions.service';

@CatalogController('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  @CreateCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  create(@Body() createRolePermissionDto: Prisma.role_permissionsCreateInput) {
    return this.rolePermissionsService.create(createRolePermissionDto);
  }

  @Post('many')
  @CreateCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  createMany(@Body() createRolePermissionDto: Prisma.role_permissionsUncheckedCreateInput[]) {
    return this.rolePermissionsService.createMany(createRolePermissionDto);
  }

  @Post('assign-permissions')
  @CreateCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  assignPermissionsToRole(
    @Body('roleId') roleId: string,
    @Body('permissionIds') permissionIds: string[]
  ) {
    return this.rolePermissionsService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Get()
  @ReadCatalog('ROLE_PERMISSIONS')
  @TransformResponse({ idField: 'role_permission_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: RolePermissions[], total: number }> {
    return await this.rolePermissionsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { role_permission_id: cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('ROLE_PERMISSIONS')
  @TransformResponse({ idField: 'role_permission_id' })
  findOne(@Param('id') id: string) {
    return this.rolePermissionsService.findOne(id);
  }

  @Get('by-role/:roleId')
  @ReadCatalog('ROLE_PERMISSIONS')
  @TransformResponse({ idField: 'role_permission_id' })
  findByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.findByRoleId(roleId);
  }

  @Patch(':id')
  @UpdateCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  update(
    @Param('id') id: string,
    @Body() updateRolePermissionDto: Prisma.role_permissionsUpdateInput
  ) {
    return this.rolePermissionsService.update(id, updateRolePermissionDto);
  }

  @Delete(':id')
  @DeleteCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  remove(@Param('id') id: string) {
    return this.rolePermissionsService.softDelete(id);
  }

  @Delete('by-role/:roleId')
  @DeleteCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  removeByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionsService.removeByRoleId(roleId);
  }

  @Delete('by-role-permission/:roleId/:permissionId')
  @DeleteCatalog('ROLE_PERMISSIONS')
  @TransformResponse()
  removeByRoleAndPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string
  ) {
    return this.rolePermissionsService.removeByRoleAndPermission(roleId, permissionId);
  }
} 