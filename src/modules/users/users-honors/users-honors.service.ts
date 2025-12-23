import { BadRequestException, ConflictException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service'; // Ajusta la ruta según tu estructura
import { CreateUserHonorDto, UpdateUserHonorDto, GroupedUserHonorsDto, HonorInCategoryDto } from './users-honors.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersHonorsService {
  private readonly logger = new Logger(UsersHonorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Función para limpiar y formatear fechas ISO-8601
   * @param dateString Fecha en formato string o Date
   * @returns Date objeto fecha formateado
   */
  private formatDate(dateString: string | Date): Date {
    if (dateString instanceof Date) {
      return dateString;
    }

    try {
      // Eliminar espacios en la parte de la hora
      const cleanDateString = dateString.replace(/(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/g, '$1:$2:$3');
      return new Date(cleanDateString);
    } catch (error) {
      throw new BadRequestException(`Invalid date format: ${dateString}`);
    }
  }

  /**
   * Crea una nueva asignación de honor a usuario.
   * Verifica si ya existe un registro para el mismo usuario y honor:
   * - Si no existe, crea uno nuevo
   * - Si existe y está activo, devuelve un mensaje de error
   * - Si existe pero está inactivo, reactiva el registro con los nuevos datos
   * @param createUserHonorDto Datos para crear la asignación.
   * @returns La asignación creada o actualizada.
   */
  async create(createUserHonorDto: CreateUserHonorDto) {
    try {
      // Validar existencia de usuario y honor
      await this.prisma.users.findUniqueOrThrow({ where: { user_id: createUserHonorDto.user_id } });
      await this.prisma.honors.findUniqueOrThrow({ where: { honor_id: createUserHonorDto.honor_id } });
      
      // Verificar si ya existe un registro para este usuario y honor
      const existingRecord = await this.prisma.users_honors.findFirst({
        where: {
          user_id: createUserHonorDto.user_id,
          honor_id: createUserHonorDto.honor_id
        }
      });
  
      // Ensure images is a valid JSON string
      let imagesValue = createUserHonorDto.images;
      if (imagesValue && typeof imagesValue !== 'string') {
        try {
          imagesValue = JSON.stringify(imagesValue);
        } catch (error) {
          throw new BadRequestException({ 
            status: false, 
            message: 'images must be a valid JSON string or array' 
          });
        }
      }
      
      // Handle the case where 'validated' is erroneously used instead of 'validate'
      const dtoAny = createUserHonorDto as any;
      let validateValue = createUserHonorDto.validate ?? false;
      
      if ('validated' in dtoAny) {
        // If 'validate' is not set but 'validated' is, use 'validated' value
        if (!('validate' in dtoAny)) {
          validateValue = dtoAny.validated;
        }
        
        // Remove the incorrect property to prevent validation errors
        delete dtoAny.validated;
      }

      const dataHonor = {
        user_id: createUserHonorDto.user_id,
        honor_id: createUserHonorDto.honor_id,
        active: createUserHonorDto.active ?? true,
        validate: validateValue,
        certificate: createUserHonorDto.certificate,
        images: imagesValue,
        document: createUserHonorDto.document,
        date: createUserHonorDto.date ? this.formatDate(createUserHonorDto.date) : undefined,
      };
  
      // Si el registro no existe, crearlo
      if (!existingRecord) {
        const newRecord = await this.prisma.users_honors.create({
          data: dataHonor,
        });

        // Invalidar caché relacionada
        await this.cacheManager.del(`user_${createUserHonorDto.user_id}_honors`);
        await this.cacheManager.del(`user_${createUserHonorDto.user_id}_honors_by_category`);

        return {
          status: true,
          message: 'Honor registered successfully',
          data: newRecord
        };
      }
  
      // Si el registro existe y está activo, devolver error
      if (existingRecord && existingRecord.active) {
        return {
          status: false,
          message: 'El usuario ya tiene la especialidad registrada',
          data: existingRecord
        };
      }
  
      // Si el registro existe pero está inactivo, actualizarlo
      if (existingRecord && !existingRecord.active) {
        const updatedRecord = await this.prisma.users_honors.update({
          where: { user_honor_id: existingRecord.user_honor_id },
          data: {
            ...dataHonor,
            active: true, // Asegurarse de activarlo
            modified_at: new Date() // Actualizar fecha de modificación
          }
        });

        // Invalidar caché relacionada
        await this.cacheManager.del(`user_${createUserHonorDto.user_id}_honors`);
        await this.cacheManager.del(`user_${createUserHonorDto.user_id}_honors_by_category`);

        return {
          status: true,
          message: 'Honor reactivated successfully',
          data: updatedRecord
        };
      }
    } catch (error) {
      this.logger.error('Error creating user honor', error);
      throw new BadRequestException({ status: false, message: 'Error creating user honor', error: error.message });
    }
  }

  /**
   * Busca todas las asignaciones de honores con paginación y filtros.
   * @param params Parámetros de búsqueda (skip, take, cursor, where, orderBy).
   * @returns Lista de asignaciones.
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.users_honorsWhereUniqueInput;
    where?: Prisma.users_honorsWhereInput;
    orderBy?: Prisma.users_honorsOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `users_honors_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult;

    try {
      const [result, total] = await Promise.all([
        this.prisma.users_honors.findMany({
          skip,
          take: take ? take + 1 : undefined,
          cursor,
          where: { ...where, active: true },
          orderBy: orderBy || { user_honor_id: 'asc' },
          include: { users: true, honors: true },
        }),
        this.prisma.users_honors.count({
          where: { ...where, active: true }
        })
      ]);

      let nextCursor = undefined;
      if (take && result.length > take) {
        const nextItem = result.pop();
        nextCursor = nextItem.user_honor_id;
      }

      const response = {
        status: true,
        data: result,
        total,
        nextCursor
      };

      await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora
      return response;
    } catch (error) {
      this.logger.error('Error retrieving user honors', error);
      throw new BadRequestException({ status: false, message: 'Error retrieving user honors' });
    }
  }

  /**
   * Busca una asignación de honor específica por su ID.
   * @param user_honor_id ID de la asignación.
   * @returns La asignación encontrada.
   * @throws NotFoundException si no se encuentra la asignación.
   */
  async findOne(user_honor_id: number) {
    const cacheKey = `user_honor_${user_honor_id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult;

    try {
      const userHonor = await this.prisma.users_honors.findUnique({
        where: { user_honor_id },
        include: { users: true, honors: { include: { honors_categories: true } } },
      });
      
      if (!userHonor || !userHonor.active) {
        throw new NotFoundException(`Especialidad con ID ${user_honor_id} no encontrada`);
      }

      const result = {
        status: true,
        data: userHonor
      };

      await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding user honor with ID ${user_honor_id}`, error);
      throw new BadRequestException({ status: false, message: `Error finding user honor with ID ${user_honor_id}` });
    }
  }

  /**
   * Actualiza una asignación de honor existente.
   * @param user_honor_id ID de la asignación a actualizar.
   * @param updateUserHonorDto Datos para actualizar.
   * @returns La asignación actualizada.
   * @throws NotFoundException si no se encuentra la asignación.
   */
  async update(user_honor_id: number, updateUserHonorDto: UpdateUserHonorDto) {
    try {
      const userHonor = await this.findOne(user_honor_id);
      
      // Formatear fecha si existe en el DTO
      if (updateUserHonorDto.date) {
        updateUserHonorDto.date = this.formatDate(updateUserHonorDto.date);
      }
      
      // Make sure images is properly handled as a JSON string
      if (updateUserHonorDto.images && typeof updateUserHonorDto.images !== 'string') {
        try {
          updateUserHonorDto.images = JSON.stringify(updateUserHonorDto.images);
        } catch (error) {
          throw new BadRequestException({ 
            status: false, 
            message: 'images must be a valid JSON string or array' 
          });
        }
      }
      
      // Handle the case where 'validated' is erroneously used instead of 'validate'
      const dtoAny = updateUserHonorDto as any;
      if ('validated' in dtoAny) {
        // If both validate and validated exist, prefer the correct one (validate)
        if (!('validate' in dtoAny)) {
          updateUserHonorDto.validate = dtoAny.validated;
        }
        
        // Remove the incorrect property to prevent validation errors
        delete dtoAny.validated;
      }
      
      const updatedUserHonor = await this.prisma.users_honors.update({
        where: { user_honor_id },
        data: {
          ...updateUserHonorDto,
          modified_at: new Date(), // Actualiza la fecha de modificación
        },
      });

      return {
        status: true,
        message: 'Honor updated successfully',
        data: updatedUserHonor
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating user honor with ID ${user_honor_id}`, error);
      throw new BadRequestException({ status: false, message: `Error updating user honor with ID ${user_honor_id}` });
    }
  }

  /**
   * Elimina una asignación de honor.
   * @param user_honor_id ID de la asignación a eliminar.
   * @returns La asignación eliminada.
   * @throws NotFoundException si no se encuentra la asignación.
   */
  async remove(user_honor_id: number) {
    try {
      const honorResult = await this.findOne(user_honor_id);
      
      // Explicitly type-cast the result to access data property
      const typedResult = honorResult as { status: boolean, data: { user_id: string } };
      const userId = typedResult.data.user_id;
      
      const deletedHonor = await this.prisma.users_honors.update({
        where: { user_honor_id },
        data: {
          active: false,
          modified_at: new Date(),
        },
      });

      // Invalidar caché
      await this.cacheManager.del(`user_honor_${user_honor_id}`);
      await this.cacheManager.del(`user_${userId}_honors`);
      await this.cacheManager.del(`user_${userId}_honors_by_category`);

      return {
        status: true,
        message: 'Honor deleted successfully',
        data: deletedHonor
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing user honor with ID ${user_honor_id}`, error);
      throw new BadRequestException({ status: false, message: `Error removing user honor with ID ${user_honor_id}` });
    }
  }

  /**
   * Busca los honores de un usuario específico, agrupados por categoría y ordenados.
   * @param userId ID del usuario.
   * @returns Lista de categorías con sus respectivos honores asignados al usuario.
   */
  async findUserHonorsGroupedByCategory(userId: string): Promise<{ status: boolean, data: GroupedUserHonorsDto[] }> {
    
    //const cacheKey = `user_${userId}_honors_by_category`;
    //let cachedResult = await this.cacheManager.get(cacheKey);

    //if (cachedResult) return cachedResult as { status: boolean, data: GroupedUserHonorsDto[] };

    try {
      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({
        where: { user_id: userId }
      });

      if (!user) {
        throw new NotFoundException({ status: false, message: `User with ID ${userId} not found` });
      }
      
      const userHonors = await this.prisma.users_honors.findMany({
        where: {
          user_id: userId,
          active: true,
        },
        include: {
          honors: {
            include: {
              honors_categories: true,
            },
          },
        },
        orderBy: [
          {
            honors: {
              honors_categories: {
                name: 'asc',
              },
            },
          },
          {
            honors: {
              name: 'asc',
            },
          },
        ],
      });

      // Agrupar por categoría
      const categoriesMap = new Map<number, GroupedUserHonorsDto>();

      userHonors.forEach(honor => {
        // Usar honors_category_id correcto desde la relación de honors
        const categoryId = honor.honors?.honors_categories?.honor_category_id || 0;
        const categoryName = honor.honors?.honors_categories?.name || 'Sin categoría';

        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            category_id: categoryId,
            category_name: categoryName,
            honors: [],
          });
        }

        categoriesMap.get(categoryId).honors.push({
          honor_id: honor.honor_id,
          honor_name: honor.honors.name,
          honor_image: honor.honors.honor_image,
          honor_material: honor.honors.material_url,
          user_honor_id: honor.user_honor_id,
          validate: honor.validate,
          certificate: honor.certificate || '',
          images: honor.images ? (typeof honor.images === 'string' ? 
                  JSON.parse(honor.images as string) : 
                  Array.isArray(honor.images) ? 
                    honor.images.map(item => String(item)) : []) : [],
          document: honor.document || '',
          date: honor.date,
        });
      });

      // Convertir el mapa a un array
      const groupedHonors = Array.from(categoriesMap.values());
      
      const result = {
        status: true,
        data: groupedHonors
      };

      //await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding honors for user ${userId}`, error);
      throw new BadRequestException({ status: false, message: `Error finding honors for user ${userId}`, error: error.message });
    }
  }
} 