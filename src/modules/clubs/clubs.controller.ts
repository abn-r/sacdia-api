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
import { ClubsService } from './clubs.service';


@Controller('clubs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @Roles(...ROLES.ALL_ADMIN, ...ROLES.LF_ADMIN)
  @Permissions(PERMISSIONS.CREATE_CLUBS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClubDto: Prisma.clubsCreateInput) {
    return this.clubsService.create(createClubDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_CLUBS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    return await this.clubsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { club_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_CLUBS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.findOne(id);
  }

  @Patch(':id')
  @Roles(...ROLES.ALL_ADMIN, ...ROLES.LF_ADMIN, ...ROLES.CLUB_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_CLUBS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: Prisma.clubsUpdateInput
  ) {
    return this.clubsService.update(id, updateClubDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_CLUBS)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft') soft?: boolean
  ) {
    return soft
      ? this.clubsService.softDelete(id)
      : this.clubsService.remove(id);
  }
}

