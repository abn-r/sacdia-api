import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Allergy } from './allergies.model';

export { Allergy };

type CreateAllergyDto = Prisma.allergiesCreateInput;
type UpdateAllergyDto = Prisma.allergiesUpdateInput;

/**
 * Allergies service using GenericCrudService
 * Reduced from ~144 lines to ~60 lines
 */
@Injectable()
export class AllergiesService extends GenericCrudService<Allergy, CreateAllergyDto, UpdateAllergyDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Allergy',
      idField: 'allergy_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.allergies;
  }

  protected getSelectFields() {
    return {
      allergy_id: true,
      name: true,
      description: true
    };
  }

  protected async validateCreate(dto: CreateAllergyDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({
        status: false,
        message: 'Name is required'
      });
    }
  }

  protected async checkDuplicate(dto: CreateAllergyDto | UpdateAllergyDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.allergies.findFirst({
      where: {
        name,
        NOT: excludeId ? { allergy_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Allergy with this name already exists'
      });
    }
  }
}