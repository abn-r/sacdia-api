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
import { DistrictsService } from './districts.service';
import { Districts } from './districts.model';
import { CreateDistrictDto } from './dtos/districts.dto';

@Controller('districts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  // @Post()
  // @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  // @Permissions(PERMISSIONS.CREATE_DISTRICTS)
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body() createDistrictDto: CreateDistrictDto) {
  //   return this.districtsService.create(createDistrictDto);
  // }

  @Post()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.CREATE_LOCAL_FIELDS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDistrictDto: Prisma.districtsCreateInput) {
    return this.districtsService.create(createDistrictDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.districtsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { district_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistrictDto: Prisma.districtsUpdateInput
  ) {
    return this.districtsService.update(id, updateDistrictDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.districtsService.softDelete(id)
      : this.districtsService.remove(id);
  }
}
