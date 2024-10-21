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
import { HonorsService } from './honors.service';

@Controller('honors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HonorsController {
  constructor(private readonly honorsService: HonorsService) {}

  @Post()
  @Roles(...ROLES.CLUB_ALL)
  @Permissions(PERMISSIONS.CREATE_HONORS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHonorDto: Prisma.honorsCreateInput) {
    return this.honorsService.create(createHonorDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_HONORS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.honorsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { honor_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_HONORS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.honorsService.findOne(id);
  }

  @Patch(':id')
  @Roles(...ROLES.ALL_ADMIN, ...ROLES.LF_ADMIN, ...ROLES.CLUB_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_HONORS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHonorDto: Prisma.honorsUpdateInput
  ) {
    return this.honorsService.update(id, updateHonorDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_HONORS)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.honorsService.softDelete(id)
      : this.honorsService.remove(id);
  }
}

