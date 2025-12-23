import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Cache } from 'cache-manager';
import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
  cursor?: any;
  where?: any;
  orderBy?: any;
}

/**
 * Configuration for the generic CRUD service
 */
export interface GenericCrudConfig {
  modelName: string;
  idField: string;
  nameField?: string;
  cacheTTL?: number;
  enableCache?: boolean;
}

/**
 * Abstract generic CRUD service that provides common operations for all catalog-type entities.
 * Extend this class to create specific services with minimal boilerplate.
 * 
 * @template TModel - The Prisma model type
 * @template TCreateDto - The DTO type for creating entities
 * @template TUpdateDto - The DTO type for updating entities
 */
@Injectable()
export abstract class GenericCrudService<TModel, TCreateDto, TUpdateDto> {
  protected readonly logger: Logger;
  protected readonly cacheTTL: number;
  protected readonly enableCache: boolean;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly cacheManager: Cache,
    protected readonly config: GenericCrudConfig
  ) {
    this.logger = new Logger(`${config.modelName}Service`);
    this.cacheTTL = config.cacheTTL || 3600000; // 1 hour default
    this.enableCache = config.enableCache !== false;
  }

  /**
   * Get the Prisma model delegate for the entity
   * Must be implemented by child classes
   */
  protected abstract getModel(): any;

  /**
   * Get the select fields for queries
   * Override in child classes to customize returned fields
   */
  protected abstract getSelectFields(): object;

  /**
   * Validate data before creation
   * Override in child classes for custom validation
   */
  protected async validateCreate(dto: TCreateDto): Promise<void> {
    // Default implementation - override in child classes
  }

  /**
   * Validate data before update
   * Override in child classes for custom validation
   */
  protected async validateUpdate(id: number | string, dto: TUpdateDto): Promise<void> {
    // Default implementation - override in child classes
  }

  /**
   * Check for duplicate entries
   * Override in child classes for custom duplicate checking
   */
  protected async checkDuplicate(dto: TCreateDto | TUpdateDto, excludeId?: number | string): Promise<void> {
    // Default implementation - override in child classes
  }

  /**
   * Get cache key for a single entity
   */
  protected getCacheKey(id: number | string): string {
    return `${this.config.modelName}_${id}`;
  }

  /**
   * Get cache key for list queries
   */
  protected getListCacheKey(params: PaginationParams): string {
    return `${this.config.modelName}_list_${JSON.stringify(params)}`;
  }

  /**
   * Invalidate all cache for this entity
   */
  protected async invalidateCache(id?: number | string): Promise<void> {
    if (!this.enableCache) return;
    
    if (id) {
      await this.cacheManager.del(this.getCacheKey(id));
    }
    // Note: In production, consider using cache patterns or tags for bulk invalidation
    await this.cacheManager.del(`${this.config.modelName}_list_*`);
  }

  /**
   * Find all entities with pagination
   */
  async findAll(params: PaginationParams): Promise<PaginatedResponse<TModel>> {
    const { skip, take, cursor, where, orderBy } = params;
    
    if (this.enableCache) {
      const cacheKey = this.getListCacheKey(params);
      const cached = await this.cacheManager.get<PaginatedResponse<TModel>>(cacheKey);
      if (cached) return cached;
    }

    const model = this.getModel();
    const idField = this.config.idField;

    const [results, total] = await Promise.all([
      model.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { [idField]: 'asc' },
        select: this.getSelectFields(),
      }),
      model.count({ where: { ...where, active: true } })
    ]);

    let nextCursor: any = undefined;
    if (take && results.length > take) {
      const nextItem = results.pop();
      nextCursor = nextItem[idField];
    }

    const response: PaginatedResponse<TModel> = {
      status: true,
      data: results,
      total,
      nextCursor,
      meta: {
        total,
        page: skip ? Math.floor(skip / (take || 10)) + 1 : 1,
        limit: take || results.length,
        nextCursor
      }
    };

    if (this.enableCache) {
      await this.cacheManager.set(this.getListCacheKey(params), response, this.cacheTTL);
    }

    return response;
  }

  /**
   * Find a single entity by ID
   */
  async findOne(id: number | string): Promise<ApiResponse<TModel>> {
    if (this.enableCache) {
      const cached = await this.cacheManager.get<ApiResponse<TModel>>(this.getCacheKey(id));
      if (cached) return cached;
    }

    const model = this.getModel();
    const entity = await model.findUnique({
      where: { [this.config.idField]: id },
      select: this.getSelectFields(),
    });

    if (!entity) {
      throw new NotFoundException({
        status: false,
        message: `${this.config.modelName} with ID ${id} not found`
      });
    }

    const response: ApiResponse<TModel> = { status: true, data: entity };

    if (this.enableCache) {
      await this.cacheManager.set(this.getCacheKey(id), response, this.cacheTTL);
    }

    return response;
  }

  /**
   * Create a new entity
   */
  async create(dto: TCreateDto): Promise<ApiResponse<TModel>> {
    await this.validateCreate(dto);
    await this.checkDuplicate(dto);

    try {
      const model = this.getModel();
      const newEntity = await model.create({
        data: dto,
      });

      await this.invalidateCache();

      return {
        status: true,
        message: `${this.config.modelName} created successfully`,
        data: newEntity
      };
    } catch (error) {
      this.logger.error(`Error creating ${this.config.modelName}`, error);
      throw new BadRequestException({
        status: false,
        message: `Error creating ${this.config.modelName}`
      });
    }
  }

  /**
   * Update an existing entity
   */
  async update(id: number | string, dto: TUpdateDto): Promise<ApiResponse<TModel>> {
    await this.findOne(id); // Verify exists
    await this.validateUpdate(id, dto);
    await this.checkDuplicate(dto, id);

    try {
      const model = this.getModel();
      const updatedEntity = await model.update({
        where: { [this.config.idField]: id },
        data: {
          ...dto,
          modified_at: new Date()
        },
        select: this.getSelectFields(),
      });

      await this.invalidateCache(id);

      return {
        status: true,
        message: `${this.config.modelName} updated successfully`,
        data: updatedEntity
      };
    } catch (error) {
      this.logger.error(`Error updating ${this.config.modelName} with ID ${id}`, error);
      throw new BadRequestException({
        status: false,
        message: `Error updating ${this.config.modelName}`
      });
    }
  }

  /**
   * Soft delete an entity
   */
  async softDelete(id: number | string): Promise<ApiResponse<void>> {
    await this.findOne(id); // Verify exists

    try {
      const model = this.getModel();
      await model.update({
        where: { [this.config.idField]: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.invalidateCache(id);

      return {
        status: true,
        message: `${this.config.modelName} deleted successfully`
      };
    } catch (error) {
      this.logger.error(`Error deleting ${this.config.modelName} with ID ${id}`, error);
      throw new BadRequestException({
        status: false,
        message: `Error deleting ${this.config.modelName}`
      });
    }
  }

  /**
   * Hard delete an entity (use with caution)
   */
  async remove(id: number | string): Promise<ApiResponse<void>> {
    await this.findOne(id); // Verify exists

    try {
      const model = this.getModel();
      await model.delete({
        where: { [this.config.idField]: id }
      });

      await this.invalidateCache(id);

      return {
        status: true,
        message: `${this.config.modelName} deleted successfully`
      };
    } catch (error) {
      this.logger.error(`Error deleting ${this.config.modelName} with ID ${id}`, error);
      throw new BadRequestException({
        status: false,
        message: `Error deleting ${this.config.modelName}`
      });
    }
  }

  /**
   * Search entities by a term
   * Override in child classes for custom search logic
   */
  async search(term: string, limit: number = 50): Promise<ApiResponse<TModel[]>> {
    const nameField = this.config.nameField || 'name';
    
    if (this.enableCache) {
      const cacheKey = `${this.config.modelName}_search_${term}`;
      const cached = await this.cacheManager.get<ApiResponse<TModel[]>>(cacheKey);
      if (cached) return cached;
    }

    const model = this.getModel();
    const results = await model.findMany({
      where: {
        [nameField]: { contains: term, mode: 'insensitive' },
        active: true
      },
      select: this.getSelectFields(),
      take: limit
    });

    const response: ApiResponse<TModel[]> = { status: true, data: results };

    if (this.enableCache) {
      await this.cacheManager.set(`${this.config.modelName}_search_${term}`, response, this.cacheTTL);
    }

    return response;
  }
}
