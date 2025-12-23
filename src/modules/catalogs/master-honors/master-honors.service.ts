import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';

export interface MasterHonor {
  master_honor_id: number;
  name: string;
  master_image?: string | null;
  active?: boolean;
}

type CreateMasterHonorDto = Prisma.master_honorsCreateInput;
type UpdateMasterHonorDto = Prisma.master_honorsUpdateInput;

/**
 * MasterHonors service using GenericCrudService
 * Reduced from ~259 lines to ~70 lines
 */
@Injectable()
export class MasterHonorsService extends GenericCrudService<MasterHonor, CreateMasterHonorDto, UpdateMasterHonorDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'MasterHonor',
      idField: 'master_honor_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.master_honors;
  }

  protected getSelectFields() {
    return {
      master_honor_id: true,
      name: true,
      master_image: true,
      active: true
    };
  }

  protected async validateCreate(dto: CreateMasterHonorDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({ status: false, message: 'Name is required' });
    }
  }

  protected async checkDuplicate(dto: CreateMasterHonorDto | UpdateMasterHonorDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.master_honors.findFirst({
      where: {
        name,
        NOT: excludeId ? { master_honor_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({ status: false, message: 'Master honor with this name already exists' });
    }
  }

  async createMany(masterHonors: Prisma.master_honorsCreateManyInput[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.master_honors.createMany({
        data: masterHonors,
        skipDuplicates: true
      });
      await this.invalidateCache();
      return { status: true, message: 'Master honors created successfully', count: result.count };
    } catch (error) {
      this.logger.error('Error creating multiple master honors', error);
      throw new BadRequestException({ status: false, message: 'Error creating master honors' });
    }
  }
} 