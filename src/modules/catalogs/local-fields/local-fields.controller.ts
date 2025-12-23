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
  Query,
  DefaultValuePipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Roles, Permissions } from '../../../common/decorators/rbac.decorators';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import * as PERMISSIONS from '../../../common/constants/permissions';
import * as ROLES from '../../../common/constants/roles';
import { LocalFieldsService } from './local-fields.service';
import { SupabaseGuard } from '../../../common/guards/supabase.guard';


@Controller('c/lf')
@ApiTags('Catalogs')
@UseGuards(SupabaseGuard, PermissionsGuard)
export class LocalFieldsController {
  constructor(private readonly localFieldsService: LocalFieldsService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.CREATE_LOCAL_FIELDS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLocalFieldDto: Prisma.local_fieldsCreateInput) {
    return this.localFieldsService.create(createLocalFieldDto);
  }

  @Get()
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_LOCAL_FIELDS)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('skip', new DefaultValuePipe('0')) skip: string,
    @Query('take', new DefaultValuePipe('50')) take: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ) {
    try {
      // Validamos y convertimos parámetros
      const skipValue = parseInt(skip, 10);
      const takeValue = parseInt(take, 10);
      
      // Verificamos que los valores sean numéricos válidos
      if (isNaN(skipValue) || isNaN(takeValue)) {
        throw new Error('Los parámetros skip y take deben ser numéricos');
      }
      
      // Limitamos el take máximo para evitar sobrecarga
      const limitedTake = Math.min(takeValue, 100);
      
      let whereValue = undefined;
      let orderByValue = undefined;
      
      if (where) {
        try {
          whereValue = JSON.parse(where);
        } catch (error) {
          throw new Error('El parámetro where debe ser un JSON válido');
        }
      }
      
      if (orderBy) {
        try {
          orderByValue = JSON.parse(orderBy);
        } catch (error) {
          throw new Error('El parámetro orderBy debe ser un JSON válido');
        }
      }
      
      return await this.localFieldsService.findAll({
        skip: skipValue,
        take: limitedTake,
        cursor: cursor ? { local_field_id: +cursor } : undefined,
        where: whereValue,
        orderBy: orderByValue,
      });
    } catch (error) {
      console.error('Error en el controlador findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  @Roles(...ROLES.ALL)
  @Permissions(PERMISSIONS.READ_LOCAL_FIELDS)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.localFieldsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN, ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.UPDATE_LOCAL_FIELDS)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocalFieldDto: Prisma.local_fieldsUpdateInput
  ) {
    return this.localFieldsService.update(id, updateLocalFieldDto);
  }

  @Delete(':id')
  @Roles(ROLES.SUPER_ADMIN)
  @Permissions(PERMISSIONS.DELETE_LOCAL_FIELDS)
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft', new DefaultValuePipe('false')) soft: string
  ) {
    const isSoft = soft === 'true';
    const result = isSoft
      ? this.localFieldsService.softDelete(id)
      : this.localFieldsService.remove(id);
    return result;
  }
}
