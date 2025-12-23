import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';

export interface RelationshipType {
  relationship_type_id: number;
  name: string;
  active?: boolean;
}

type CreateRelationshipTypeDto = Prisma.relationship_typeCreateInput;
type UpdateRelationshipTypeDto = Prisma.relationship_typeUpdateInput;

/**
 * RelationshipType service using GenericCrudService
 * Reduced from ~259 lines to ~70 lines
 */
@Injectable()
export class RelationshipTypeService extends GenericCrudService<RelationshipType, CreateRelationshipTypeDto, UpdateRelationshipTypeDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'RelationshipType',
      idField: 'relationship_type_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.relationship_type;
  }

  protected getSelectFields() {
    return {
      relationship_type_id: true,
      name: true
    };
  }

  protected async validateCreate(dto: CreateRelationshipTypeDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({ status: false, message: 'Name is required' });
    }
  }

  protected async checkDuplicate(dto: CreateRelationshipTypeDto | UpdateRelationshipTypeDto, excludeId?: number): Promise<void> {
    const name = dto.name as string;
    if (!name) return;

    const existing = await this.prisma.relationship_type.findFirst({
      where: {
        name,
        NOT: excludeId ? { relationship_type_id: excludeId } : undefined
      }
    });

    if (existing) {
      throw new ConflictException({ status: false, message: 'Relationship Type with this name already exists' });
    }
  }

  async createMany(relationshipTypes: CreateRelationshipTypeDto[]): Promise<{ status: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.relationship_type.createMany({
        data: relationshipTypes as any,
        skipDuplicates: true
      });
      await this.invalidateCache();
      return { status: true, message: 'Relationship Types created successfully', count: result.count };
    } catch (error) {
      this.logger.error('Error creating multiple relationship types', error);
      throw new BadRequestException({ status: false, message: 'Error creating relationship types' });
    }
  }
}
