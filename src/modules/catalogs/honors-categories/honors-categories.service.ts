import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';

export interface HonorCategory {
  honor_category_id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  active?: boolean;
}

type CreateHonorCategoryDto = Prisma.honors_categoriesCreateInput;
type UpdateHonorCategoryDto = Prisma.honors_categoriesUpdateInput;

/**
 * HonorsCategories service using GenericCrudService
 * Reduced from ~245 lines to ~70 lines
 */
@Injectable()
export class HonorsCategoriesService extends GenericCrudService<HonorCategory, CreateHonorCategoryDto, UpdateHonorCategoryDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'HonorCategory',
      idField: 'honor_category_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.honors_categories;
  }

  protected getSelectFields() {
    return {
      honor_category_id: true,
      name: true,
      description: true,
      icon: true,
      active: true
    };
  }

  protected async validateCreate(dto: CreateHonorCategoryDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({ status: false, message: 'Name is required' });
    }
  }

  protected async checkDuplicate(dto: CreateHonorCategoryDto | UpdateHonorCategoryDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.honors_categories.findFirst({
      where: {
        name,
        NOT: excludeId ? { honor_category_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({ status: false, message: 'Honor category with this name already exists' });
    }
  }

  async createMany(categories: Prisma.honors_categoriesCreateManyInput[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.honors_categories.createMany({
        data: categories,
        skipDuplicates: true
      });
      await this.invalidateCache();
      return { status: true, message: 'Honor categories created successfully', count: result.count };
    } catch (error) {
      this.logger.error('Error creating multiple honor categories', error);
      throw new BadRequestException({ status: false, message: 'Error creating honor categories' });
    }
  }
} 