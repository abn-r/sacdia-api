import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Unions } from './unions.model';

type CreateUnionDto = Prisma.unionsCreateInput;
type UpdateUnionDto = Prisma.unionsUpdateInput;

/**
 * Unions service using GenericCrudService
 * Reduced from ~368 lines to ~170 lines
 */
@Injectable()
export class UnionsService extends GenericCrudService<Unions, CreateUnionDto, UpdateUnionDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'Union',
      idField: 'union_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.unions;
  }

  protected getSelectFields() {
    return {
      union_id: true,
      name: true,
      abbreviation: true,
      countries: {
        select: {
          country_id: true,
          name: true
        }
      }
    };
  }

  protected async validateCreate(dto: CreateUnionDto): Promise<void> {
    if (!dto.name || !dto.abbreviation || !dto.countries) {
      throw new BadRequestException({
        status: false,
        message: 'Name, abbreviation and country are required'
      });
    }

    const countryId = (dto.countries as any).connect?.country_id;
    if (!countryId) {
      throw new BadRequestException({ status: false, message: 'Valid country ID is required' });
    }

    const country = await this.prisma.countries.findUnique({
      where: { country_id: countryId }
    });

    if (!country) {
      throw new NotFoundException({ status: false, message: `Country with ID ${countryId} not found` });
    }
  }

  protected async checkDuplicate(dto: CreateUnionDto | UpdateUnionDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    const abbreviation = dto.abbreviation as string;

    if (!name && !abbreviation) return;

    const orConditions = [];
    if (name) orConditions.push({ name });
    if (abbreviation) orConditions.push({ abbreviation });

    const existing = await this.prisma.unions.findFirst({
      where: {
        OR: orConditions,
        NOT: excludeId ? { union_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Union with this name or abbreviation already exists'
      });
    }
  }

  /**
   * Find unions by country
   */
  async findByCountry(countryId: number) {
    const cacheKey = `country_${countryId}_unions`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: any[] };
    }

    const country = await this.prisma.countries.findUnique({
      where: { country_id: countryId }
    });

    if (!country) {
      throw new NotFoundException({ status: false, message: `Country with ID ${countryId} not found` });
    }

    const unions = await this.prisma.unions.findMany({
      where: { country_id: countryId, active: true },
      orderBy: { name: 'asc' }
    });

    const result = { status: true, data: unions };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, result, this.cacheTTL);
    }

    return result;
  }

  /**
   * Custom search including abbreviation
   */
  async search(term: string, limit: number = 100) {
    const cacheKey = `${this.config.modelName}_search_${term}`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: Unions[] };
    }

    const results = await this.prisma.unions.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { abbreviation: { contains: term, mode: 'insensitive' } }
        ],
        active: true
      },
      include: {
        countries: {
          select: { country_id: true, name: true }
        }
      },
      take: limit
    });

    const response = { status: true, data: results };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, response, this.cacheTTL);
    }

    return response;
  }

  /**
   * Create multiple unions
   */
  async createMany(unions: CreateUnionDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      let count = 0;
      const countryIds = new Set<number>();

      for (const union of unions) {
        if (!union.name || !union.abbreviation || !union.countries) continue;

        const countryId = (union.countries as any).connect?.country_id;
        if (!countryId) continue;

        const existingUnion = await this.prisma.unions.findFirst({
          where: {
            OR: [{ name: union.name }, { abbreviation: union.abbreviation }]
          }
        });

        if (existingUnion) continue;

        await this.prisma.unions.create({
          data: {
            name: union.name,
            abbreviation: union.abbreviation,
            active: union.active !== undefined ? union.active : true,
            countries: union.countries
          }
        });

        countryIds.add(countryId);
        count++;
      }

      await this.invalidateCache();
      for (const countryId of countryIds) {
        await this.cacheManager.del(`country_${countryId}_unions`);
      }

      return { status: true, message: 'Unions created successfully', count };
    } catch (error) {
      this.logger.error('Error creating multiple unions', error);
      throw new BadRequestException({ status: false, message: 'Error creating unions' });
    }
  }
}