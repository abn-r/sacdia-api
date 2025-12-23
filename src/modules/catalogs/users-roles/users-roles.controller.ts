import { Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogController } from '../../../common/decorators/catalog-controller.decorator';
import { ReadCatalog, CreateCatalog, UpdateCatalog, DeleteCatalog } from '../../../common/decorators/catalog-endpoint.decorator';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
import { UsersRoles } from './users-roles.model';
import { UsersRolesService } from './users-roles.service';

@CatalogController('users-roles')
export class UsersRolesController {
  constructor(private readonly usersRolesService: UsersRolesService) {}

  @Post()
  @CreateCatalog('USERS_ROLES')
  @TransformResponse()
  create(@Body() createUserRoleDto: Prisma.users_rolesCreateInput) {
    return this.usersRolesService.create(createUserRoleDto);
  }

  @Post('many')
  @CreateCatalog('USERS_ROLES')
  @TransformResponse()
  createMany(@Body() createUserRoleDto: Prisma.users_rolesUncheckedCreateInput[]) {
    return this.usersRolesService.createMany(createUserRoleDto);
  }

  @Post('assign-roles')
  @CreateCatalog('USERS_ROLES')
  @TransformResponse()
  assignRolesToUser(
    @Body('userId') userId: string,
    @Body('roleIds') roleIds: string[]
  ) {
    return this.usersRolesService.assignRolesToUser(userId, roleIds);
  }

  @Post('assign-users')
  @CreateCatalog('USERS_ROLES')
  @TransformResponse()
  assignUsersToRole(
    @Body('roleId') roleId: string,
    @Body('userIds') userIds: string[]
  ) {
    return this.usersRolesService.assignUsersToRole(roleId, userIds);
  }

  @Get()
  @ReadCatalog('USERS_ROLES')
  @TransformResponse({ idField: 'user_role_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: UsersRoles[], total: number }> {
    return await this.usersRolesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { user_role_id: cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadCatalog('USERS_ROLES')
  @TransformResponse({ idField: 'user_role_id' })
  findOne(@Param('id') id: string) {
    return this.usersRolesService.findOne(id);
  }

  @Get('by-user/:userId')
  @ReadCatalog('USERS_ROLES')
  @TransformResponse({ idField: 'user_role_id' })
  findByUser(@Param('userId') userId: string) {
    return this.usersRolesService.findByUserId(userId);
  }

  @Get('by-role/:roleId')
  @ReadCatalog('USERS_ROLES')
  @TransformResponse({ idField: 'user_role_id' })
  findByRole(@Param('roleId') roleId: string) {
    return this.usersRolesService.findByRoleId(roleId);
  }

  @Patch(':id')
  @UpdateCatalog('USERS_ROLES')
  @TransformResponse()
  update(
    @Param('id') id: string,
    @Body() updateUserRoleDto: Prisma.users_rolesUpdateInput
  ) {
    return this.usersRolesService.update(id, updateUserRoleDto);
  }

  @Delete(':id')
  @DeleteCatalog('USERS_ROLES')
  @TransformResponse()
  remove(@Param('id') id: string) {
    return this.usersRolesService.softDelete(id);
  }

  @Delete('by-user/:userId')
  @DeleteCatalog('USERS_ROLES')
  @TransformResponse()
  removeByUser(@Param('userId') userId: string) {
    return this.usersRolesService.removeByUserId(userId);
  }

  @Delete('by-role/:roleId')
  @DeleteCatalog('USERS_ROLES')
  @TransformResponse()
  removeByRole(@Param('roleId') roleId: string) {
    return this.usersRolesService.removeByRoleId(roleId);
  }

  @Delete('by-user-role/:userId/:roleId')
  @DeleteCatalog('USERS_ROLES')
  @TransformResponse()
  removeByUserAndRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string
  ) {
    return this.usersRolesService.removeByUserAndRole(userId, roleId);
  }
} 