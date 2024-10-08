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
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles, Permissions } from '../../decorators/rbac.decorators';
import { PermissionsGuard } from '../../guards/permissions.guard';
import * as PERMISSIONS from '../../constants/permissions';
import * as ROLES from '../../constants/roles';
import { UnionsService } from './unions.service';

@Controller('unions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UnionsController {
  constructor(private readonly unionsService: UnionsService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.CREATE_UNIONS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUnionDto: Prisma.unionsCreateInput) {
    return this.unionsService.create(createUnionDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_UNIONS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {//: Promise<(Omit<Unions, 'countries'> & { countries: { name: string } })[]> {
    return await this.unionsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { union_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_UNIONS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_UNIONS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnionDto: Prisma.unionsUpdateInput
  ) {
    return this.unionsService.update(id, updateUnionDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_UNIONS)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.unionsService.softDelete(id)
      : this.unionsService.remove(id);
  }
}

