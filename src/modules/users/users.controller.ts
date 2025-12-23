import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { Roles, Permissions } from '../../common/decorators/rbac.decorators';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { SupabaseGuard } from '../../common/guards/supabase.guard';
import * as PERMISSIONS from '../../common/constants/permissions';
import * as ROLES from '../../common/constants/roles';


@Controller('users')
@ApiTags('Users')
@UseGuards(SupabaseGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_USERS)
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return this.usersService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { user_id: cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_USERS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne({ user_id: id });
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.USER)
  @Permissions(PERMISSIONS.UPDATE_USERS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.usersUpdateInput,
  ) {
    return this.usersService.update({ user_id: id }, updateUserDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_USERS)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove({ user_id: id });
  }

}