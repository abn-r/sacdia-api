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
import { CountriesService } from './countries.service';
import { Countries } from './countries.model';

@Controller('countries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.CREATE_COUNTRIES)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCountryDto: Prisma.countriesCreateInput) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  @Permissions(PERMISSIONS.READ_COUNTRIES)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<Countries[]> {
    return await this.countriesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { country_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_COUNTRIES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_COUNTRIES)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: Prisma.countriesUpdateInput
  ) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_COUNTRIES)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.countriesService.softDelete(id)
      : this.countriesService.remove(id);
  }
}
