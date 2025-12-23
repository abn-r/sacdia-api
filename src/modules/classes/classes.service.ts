import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { GenericCrudService } from '../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Classes } from './classes.model';

type CreateClassDto = Prisma.classesCreateInput;
type UpdateClassDto = Prisma.classesUpdateInput;

/**
 * Classes service using GenericCrudService
 * Reduced from ~164 lines to ~70 lines
 */
@Injectable()
export class ClassesService extends GenericCrudService<Classes, CreateClassDto, UpdateClassDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Class',
      idField: 'class_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.classes;
  }

  protected getSelectFields() {
    return {
      class_id: true,
      name: true,
      description: true,
      active: true,
      club_type_id: true,
      minimum_age: true,
      material_url: true,
      club_types: { select: { ct_id: true, name: true } }
    };
  }

  protected async validateCreate(dto: CreateClassDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({
        status: false,
        message: 'Name is required'
      });
    }
  }

  protected async checkDuplicate(dto: CreateClassDto | UpdateClassDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.classes.findFirst({
      where: {
        name,
        NOT: excludeId ? { class_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Class with this name already exists'
      });
    }
  }
}