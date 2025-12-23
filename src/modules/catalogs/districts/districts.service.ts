import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { Districts } from './districts.model';

type CreateDistrictDto = Prisma.districtsCreateInput;
type UpdateDistrictDto = Prisma.districtsUpdateInput;

/**
 * Districts service using GenericCrudService
 * Reduced from ~360 lines to ~180 lines
 */
@Injectable()
export class DistrictsService extends GenericCrudService<Districts, CreateDistrictDto, UpdateDistrictDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'District',
      idField: 'district_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.districts;
  }

  protected getSelectFields() {
    return {
      district_id: true,
      name: true,
      local_fields: {
        select: {
          local_field_id: true,
          name: true
        }
      }
    };
  }

  protected async validateCreate(dto: CreateDistrictDto): Promise<void> {
    if (!dto.name || !dto.local_fields) {
      throw new BadRequestException({
        status: false,
        message: 'Name and local field are required'
      });
    }

    const localFieldId = (dto.local_fields as any).connect?.local_field_id;
    if (!localFieldId) {
      throw new BadRequestException({ status: false, message: 'Valid local field ID is required' });
    }

    const localField = await this.prisma.local_fields.findUnique({
      where: { local_field_id: localFieldId }
    });

    if (!localField) {
      throw new NotFoundException({ status: false, message: `Local field with ID ${localFieldId} not found` });
    }
  }

  protected async checkDuplicate(dto: CreateDistrictDto | UpdateDistrictDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const localFieldId = (dto.local_fields as any)?.connect?.local_field_id;
    if (!localFieldId) return;

    const existing = await this.prisma.districts.findFirst({
      where: {
        name,
        local_field_id: localFieldId,
        NOT: excludeId ? { district_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'District with this name already exists in this local field'
      });
    }
  }

  /**
   * Find districts by local field
   */
  async findByLocalField(localFieldId: number) {
    const cacheKey = `local_field_${localFieldId}_districts`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: any[] };
    }

    const localField = await this.prisma.local_fields.findUnique({
      where: { local_field_id: localFieldId }
    });

    if (!localField) {
      throw new NotFoundException({ status: false, message: `Local field with ID ${localFieldId} not found` });
    }

    const districts = await this.prisma.districts.findMany({
      where: { local_field_id: localFieldId, active: true },
      orderBy: { name: 'asc' }
    });

    const result = { status: true, data: districts };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, result, this.cacheTTL);
    }

    return result;
  }

  /**
   * Create multiple districts
   */
  async createMany(districts: CreateDistrictDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      let count = 0;
      const localFieldIds = new Set<number>();

      for (const district of districts) {
        if (!district.name || !district.local_fields) continue;

        const localFieldId = (district.local_fields as any).connect?.local_field_id;
        if (!localFieldId) continue;

        const existingDistrict = await this.prisma.districts.findFirst({
          where: { name: district.name, local_field_id: localFieldId }
        });

        if (existingDistrict) continue;

        await this.prisma.districts.create({
          data: {
            name: district.name,
            active: district.active !== undefined ? district.active : true,
            local_fields: district.local_fields
          }
        });

        localFieldIds.add(localFieldId);
        count++;
      }

      await this.invalidateCache();
      for (const localFieldId of localFieldIds) {
        await this.cacheManager.del(`local_field_${localFieldId}_districts`);
      }

      return { status: true, message: 'Districts created successfully', count };
    } catch (error) {
      this.logger.error('Error creating multiple districts', error);
      throw new BadRequestException({ status: false, message: 'Error creating districts' });
    }
  }
}