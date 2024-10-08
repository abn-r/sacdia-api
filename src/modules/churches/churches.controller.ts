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
} from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { Roles, Permissions } from '../../decorators/rbac.decorators';
import * as PERMISSIONS from '../../constants/permissions';
import * as ROLES from '../../constants/roles';

@Controller('churches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.CREATE_LOCAL_FIELDS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createChurchDto: Prisma.churchesUncheckedCreateInput) {
    return this.churchesService.create(createChurchDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return this.churchesService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { church_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.churchesService.findOne({ church_id: +id });
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateSongDto: Prisma.churchesUpdateInput,
  ) {
    return this.churchesService.update({ church_id: +id }, updateSongDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_DISTRICTS)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.churchesService.remove({ church_id: +id });
  }
}
