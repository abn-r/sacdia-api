import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Diseases } from './diseases.model';

type CreateDiseaseDto = Prisma.diseasesCreateInput;
type UpdateDiseaseDto = Prisma.diseasesUpdateInput;

/**
 * Diseases service using GenericCrudService
 * Reduced from ~231 lines to ~90 lines
 */
@Injectable()
export class DiseasesService extends GenericCrudService<Diseases, CreateDiseaseDto, UpdateDiseaseDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Disease',
      idField: 'disease_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.diseases;
  }

  protected getSelectFields() {
    return {
      disease_id: true,
      name: true,
      description: true
    };
  }

  protected async validateCreate(dto: CreateDiseaseDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({
        status: false,
        message: 'Name is required'
      });
    }
  }

  protected async checkDuplicate(dto: CreateDiseaseDto | UpdateDiseaseDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.diseases.findFirst({
      where: {
        name,
        NOT: excludeId ? { disease_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Disease with this name already exists'
      });
    }
  }

  /**
   * Custom search including description
   */
  async search(term: string, limit: number = 50) {
    const cacheKey = `${this.config.modelName}_search_${term}`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: Diseases[] };
    }

    const results = await this.prisma.diseases.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } }
        ],
        active: true
      },
      select: this.getSelectFields(),
      take: limit
    });

    const response = { status: true, data: results };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, response, this.cacheTTL);
    }

    return response;
  }

  /**
   * Create multiple diseases at once
   */
  async createMany(diseases: CreateDiseaseDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.diseases.createMany({
        data: diseases as any,
        skipDuplicates: true
      });

      await this.invalidateCache();

      return {
        status: true,
        message: 'Diseases created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple diseases', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating diseases'
      });
    }
  }
}