import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { ClubTypes } from './club_types.model';

type CreateClubTypeDto = Prisma.club_typesCreateInput;
type UpdateClubTypeDto = Prisma.club_typesUpdateInput;

/**
 * ClubTypes service using GenericCrudService
 * Reduced from ~219 lines to ~70 lines
 */
@Injectable()
export class ClubTypesService extends GenericCrudService<ClubTypes, CreateClubTypeDto, UpdateClubTypeDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'ClubType',
      idField: 'ct_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.club_types;
  }

  protected getSelectFields() {
    return {
      ct_id: true,
      name: true
    };
  }

  protected async validateCreate(dto: CreateClubTypeDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({
        status: false,
        message: 'Name is required'
      });
    }
  }

  protected async checkDuplicate(dto: CreateClubTypeDto | UpdateClubTypeDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.club_types.findFirst({
      where: {
        name,
        NOT: excludeId ? { ct_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({
        status: false,
        message: 'Club type with this name already exists'
      });
    }
  }

  async createMany(clubTypes: CreateClubTypeDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.club_types.createMany({
        data: clubTypes as any,
        skipDuplicates: true
      });

      await this.invalidateCache();

      return {
        status: true,
        message: 'Club types created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple club types', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating club types'
      });
    }
  }
}