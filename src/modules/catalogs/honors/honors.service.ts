// import { SelectSubset } from './../../../../node_modules/.prisma/client/index.d';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class HonorsService {
  private readonly logger = new Logger(HonorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    // Removed PrismaClient instantiation here as prisma service is already injected
    // const prismaLog = new PrismaClient({
    //   log: ['query', 'info', 'warn', 'error'],
    // });
  }

  async create(createHonorDto: Prisma.honorsCreateInput) {
    if (!createHonorDto.name) {
      throw new BadRequestException({ status: false, message: 'Name is required' });
    }

    // Ensure club_types is provided for connection using the nested structure
    if (!createHonorDto.club_types || !createHonorDto.club_types.connect || !createHonorDto.club_types.connect.ct_id) {
      throw new BadRequestException({ status: false, message: 'Club type ID is required to create an honor via club_types.connect.ct_id' });
    }

    const existingHonor = await this.prisma.honors.findFirst({
      where: { 
        name: createHonorDto.name,
        club_type_id: createHonorDto.club_types.connect.ct_id // Check uniqueness for the same club type
      }
    });

    if (existingHonor) {
      throw new ConflictException({ status: false, message: 'Honor with this name already exists for this club type' });
    }

    try {
      // Prepare data, ensuring 'active' defaults to true if not provided
      const dataToCreate: Prisma.honorsCreateInput = {
        ...createHonorDto,
        active: createHonorDto.active !== undefined ? createHonorDto.active : true,
      };

      await this.prisma.honors.create({
        data: dataToCreate,
      });

      await this.cacheManager.del(`honors_list_*`);
      await this.cacheManager.del(`honors_grouped_*`);


      return { status: true, message: 'Honor created successfully' };
    } catch (error) {
      this.logger.error('Error creating honor, invalid data', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException({ status: false, message: 'Invalid data: Related record (club type, category, or master honor) not found.' });
      }
      throw new BadRequestException({ status: false, message: 'Error creating honor, invalid data' });
    }
  }

  async createMany(honors: Prisma.honorsCreateManyInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Prisma.honorsCreateManyInput does not support nested writes for relations.
      // It expects direct scalar values for foreign keys like club_type_id, honors_category_id.
      // The DTO consuming this should ensure these IDs are present directly in each item of the 'honors' array.
      const result = await this.prisma.honors.createMany({
        data: honors,
        skipDuplicates: true, // This will skip if a unique constraint (e.g., name + club_type_id) is violated
      });

      await this.cacheManager.del('honors_list_*');
      await this.cacheManager.del(`honors_grouped_*`);

      return {
        status: true,
        message: 'Honors created successfully',
        count: result.count
      };
    } catch (error) {
      this.logger.error('Error creating multiple honors', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating honors'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.honorsWhereUniqueInput;
    where?: Prisma.honorsWhereInput;
    orderBy?: Prisma.honorsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `honors_list_${JSON.stringify(params)}`;
    const cachedResult = await this.cacheManager.get<any>(cacheKey);

    if (cachedResult) return cachedResult;

    const [result, total] = await Promise.all([
      this.prisma.honors.findMany({
        skip,
        take: take ? take + 1 : undefined, // Fetch one extra to determine if there's a next page
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { honor_id: 'asc' },
        select: {
          honor_id: true,
          name: true,
          description: true,
          honor_image: true,
          material_url: true,
          active: true,
          club_type_id: true,
          honors_category_id: true,
          master_honors_id: true,
          club_types: { select: { ct_id: true, name: true } },
          honors_categories: { select: { honor_category_id: true, name: true } },
          master_honors: { select: { master_honor_id: true, name: true } },
        }
      }),
      this.prisma.honors.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor: number | undefined = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop(); // Remove the extra item
      if (nextItem) {
      nextCursor = nextItem.honor_id;
      }
    }

    const response = {
      status: true,
      data: result,
      total,
      nextCursor
    };

    await this.cacheManager.set(cacheKey, response, { ttl: 3600 } as any); // 1 hour

    return response;
  }

  async findOne(id: number) {
    const cacheKey = `honor_${id}`;
    const cachedResult = await this.cacheManager.get<any>(cacheKey);

    if (cachedResult) return cachedResult;

    const honor = await this.prisma.honors.findUnique({
      where: { honor_id: id, active: true },
      select: {
        honor_id: true,
        name: true,
        description: true,
        honor_image: true,
        material_url: true,
        active: true,
        club_type_id: true,
        honors_category_id: true,
        master_honors_id: true,
        created_at: true,
        modified_at: true,
        club_types: { select: { ct_id: true, name: true } },
        honors_categories: { select: { honor_category_id: true, name: true, description: true, icon: true } },
        master_honors: { select: { master_honor_id: true, name: true } },
        // If there are other relations to include, add them here.
      }
    });

    if (!honor) { // active: true is already in the where clause
      throw new NotFoundException({ status: false, message: `Honor with ID ${id} not found or is inactive` });
    }

    const result = { status: true, data: honor };
    await this.cacheManager.set(cacheKey, result, { ttl: 3600 } as any); // 1 hour
    return result;
  }

  async search(term: string) {
    const cacheKey = `honors_search_${term}`;
    const cachedResult = await this.cacheManager.get<any>(cacheKey);

    if (cachedResult) return cachedResult;

    const results = await this.prisma.honors.findMany({
      where: {
        AND: [
          { active: true },
          {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } }
        ],
          }
        ]
      },
      select: {
        honor_id: true,
        name: true,
        description: true,
        honor_image: true,
        club_types: { select: { name: true } },
        honors_categories: { select: { name: true } },
        master_honors: { select: { name: true } }
      },
      take: 50
    });

    const response = { status: true, data: results };
    await this.cacheManager.set(cacheKey, response, { ttl: 3600 } as any); // 1 hour

    return response;
  }

  async update(id: number, updateHonorDto: Prisma.honorsUpdateInput) {
    const existingHonorById = await this.prisma.honors.findUnique({ where: { honor_id: id, active: true } });
    if (!existingHonorById) {
      throw new NotFoundException({ status: false, message: `Honor with ID ${id} not found or is inactive` });
    }

    // Handle potential name and club_type_id uniqueness conflict
    if (updateHonorDto.name && (updateHonorDto.club_types as Prisma.club_typesUpdateOneRequiredWithoutHonorsNestedInput)?.connect?.ct_id) {
      const clubTypeId = (updateHonorDto.club_types as Prisma.club_typesUpdateOneRequiredWithoutHonorsNestedInput).connect.ct_id;
      const conflictingHonor = await this.prisma.honors.findFirst({
        where: {
          name: updateHonorDto.name as string,
          club_type_id: clubTypeId,
          NOT: { honor_id: id }
        }
      });
      if (conflictingHonor) {
        throw new ConflictException({ status: false, message: `Another honor with name '${updateHonorDto.name}' already exists for the specified club type.` });
      }
    } else if (updateHonorDto.name && !updateHonorDto.club_types) {
       // If only name is updated, check against existing club_type_id
       const conflictingHonor = await this.prisma.honors.findFirst({
        where: {
          name: updateHonorDto.name as string,
          club_type_id: existingHonorById.club_type_id, // use existing club_type_id
          NOT: { honor_id: id }
        }
      });
      if (conflictingHonor) {
        throw new ConflictException({ status: false, message: `Another honor with name '${updateHonorDto.name}' already exists for club type ID ${existingHonorById.club_type_id}.` });
      }
    }


    try {
    const updatedHonor = await this.prisma.honors.update({
      where: { honor_id: id },
      data: {
        ...updateHonorDto,
        modified_at: new Date()
      },
        select: { // Select the fields you want to return
        honor_id: true,
        name: true,
        description: true,
        honor_image: true,
          material_url: true,
          active: true,
          club_type_id: true,
        honors_category_id: true,
        master_honors_id: true,
          club_types: { select: { ct_id: true, name: true } },
          honors_categories: { select: { honor_category_id: true, name: true } },
          master_honors: { select: { master_honor_id: true, name: true } },
      }
    });

    await this.cacheManager.del(`honor_${id}`);
    await this.cacheManager.del(`honors_list_*`);
      await this.cacheManager.del(`honors_grouped_*`);


      return { status: true, data: updatedHonor, message: "Honor updated successfully" };
    } catch (error) {
      this.logger.error(`Error updating honor ID ${id}`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException({ status: false, message: 'Invalid data: Related record (club type, category, or master honor) not found for update.' });
      }
      throw new BadRequestException({ status: false, message: 'Error updating honor' });
    }
  }

  async softDelete(id: number) {
    const honor = await this.prisma.honors.findUnique({ where: { honor_id: id, active: true }});
    if (!honor) {
        throw new NotFoundException({ status: false, message: `Honor with ID ${id} not found or is already inactive` });
    }

    try {
      await this.prisma.honors.update({
        where: { honor_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`honor_${id}`);
      await this.cacheManager.del(`honors_list_*`);
      await this.cacheManager.del(`honors_grouped_*`);


      return { status: true, message: 'Honor deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting honor ID ${id}`, error);
      throw new BadRequestException({ status: false, message: 'Error deleting honor' });
    }
  }

  /**
   * Busca todas las especialidades/honores agrupadas por categoría
   * @param select Campos a seleccionar para cada honor (opcional) - Deprecated, select is now fixed for consistency
   * @returns Lista de categorías con sus respectivos honores
   */
  async findAllGroupedByCategory() {
    const cacheKey = `honors_grouped_all`;
    const cachedResult = await this.cacheManager.get<any>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const categoriesWithHonors = await this.prisma.honors_categories.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          honors: {
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
            select: {
              honor_id: true,
              name: true,
              description: true,
              honor_image: true,
              material_url: true,
              active: true, // Should always be true due to where clause, but good to select
              club_type_id: true, // For context if needed client-side
              club_types: { select: { name: true }}, // Name of the club type
              master_honors_id: true,
              master_honors: { select: { name: true}} // Name of the master honor if linked
            },
          },
        },
      });

      const result = categoriesWithHonors.map(category => ({
          category_id: category.honor_category_id,
          category_name: category.name,
          category_description: category.description,
          category_icon: category.icon,
        honors: category.honors,
      }));

      const response = { status: true, data: result };
      await this.cacheManager.set(cacheKey, response, { ttl: 3600 } as any); // 1 hour
      return response;

    } catch (error) {
      this.logger.error('Error getting honors grouped by category', error);
      throw new BadRequestException({ 
        status: false, 
        message: 'Error getting honors grouped by category' 
      });
    }
  }
} 