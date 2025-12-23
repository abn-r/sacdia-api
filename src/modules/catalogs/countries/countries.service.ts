import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Countries } from './countries.model';

type CreateCountryDto = Prisma.countriesCreateInput;
type UpdateCountryDto = Prisma.countriesUpdateInput;

/**
 * Countries service using GenericCrudService
 * Reduced from ~270 lines to ~80 lines
 */
@Injectable()
export class CountriesService extends GenericCrudService<Countries, CreateCountryDto, UpdateCountryDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Country',
      idField: 'country_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.countries;
  }

  protected getSelectFields() {
    return {
      country_id: true,
      name: true,
      abbreviation: true
    };
  }

  protected async validateCreate(dto: CreateCountryDto): Promise<void> {
    if (!dto.name || !dto.abbreviation) {
      throw new BadRequestException({
        status: false,
        message: 'Name and abbreviation are required'
      });
    }
  }

  protected async checkDuplicate(dto: CreateCountryDto | UpdateCountryDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    const abbreviation = dto.abbreviation as string;

    if (!name && !abbreviation) return;

    const orConditions = [];
    if (name) orConditions.push({ name });
    if (abbreviation) orConditions.push({ abbreviation });

    const existing = await this.prisma.countries.findFirst({
      where: {
        OR: orConditions,
        NOT: excludeId ? { country_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Country with this name or abbreviation already exists'
      });
    }
  }

  /**
   * Custom search that includes abbreviation
   */
  async search(term: string, limit: number = 50) {
    const cacheKey = `${this.config.modelName}_search_${term}`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: Countries[] };
    }

    const results = await this.prisma.countries.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { abbreviation: { contains: term, mode: 'insensitive' } }
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
   * Create multiple countries at once
   */
  async createMany(countries: CreateCountryDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.countries.createMany({
        data: countries as any,
        skipDuplicates: true
      });

      await this.invalidateCache();

      return {
        status: true,
        message: 'Countries created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple countries', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating countries'
      });
    }
  }
}
