import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma, blood_type as BloodTypeEnum, blood_type as BloodType } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

// Interface extendida para manejar campos personalizados
interface UpdateUserDto extends Prisma.usersUpdateInput {
  is_baptized?: boolean;
  blood_type?: string;
  country_id?: number;
  union_id?: number;
  local_field_id?: number;
  club_id?: number;
}

interface CreateUserDto extends Prisma.usersCreateInput {
  is_baptized?: boolean;
  blood_type?: string;
}

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.usersWhereUniqueInput;
      where?: Prisma.usersWhereInput;
      orderBy?: Prisma.usersOrderByWithRelationInput;
    }
  ) {
    const { skip, take, cursor, where, orderBy } = params;
    const users = await this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where: { ...where, active: true },
      orderBy: orderBy || { name: 'asc' },
    });

    return {status: true, data: users, total: users.length};
  }

  async findOne(usersWhereUniqueInput: Prisma.usersWhereUniqueInput) {
    const user = await this.prisma.users.findUnique({
      where: usersWhereUniqueInput
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${usersWhereUniqueInput.user_id} not found`);
    }


    return {status: true, data: user};
  }

  // Función para limpiar y formatear fechas ISO-8601
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

  async update(
    where: Prisma.usersWhereUniqueInput,
    updateUserDto: UpdateUserDto,
  ) {
    await this.findOne({ user_id: where.user_id });

    if (updateUserDto.name) {
      await this.checkDuplicate('name', updateUserDto.name as string, where.user_id);
    }
    if (updateUserDto.email) {
      await this.checkDuplicate('email', updateUserDto.email as string, where.user_id);
    }

    try {
      const dataForPrisma: Prisma.usersUpdateInput = {};

      // Iterate over updateUserDto to populate dataForPrisma with transformations
      for (const key in updateUserDto) {
        if (Object.prototype.hasOwnProperty.call(updateUserDto, key)) {
          const value = updateUserDto[key as keyof UpdateUserDto];

          if (key === 'blood_type' && value !== undefined && value !== null) {
            const bloodTypeMapping: { [key: string]: string } = {
              'A+': 'A_POSITIVE', 'A-': 'A_NEGATIVE', 'B+': 'B_POSITIVE', 'B-': 'B_NEGATIVE',
              'AB+': 'AB_POSITIVE', 'AB-': 'AB_NEGATIVE', 'O+': 'O_POSITIVE', 'O-': 'O_NEGATIVE'
            };
            const mappedBloodType = bloodTypeMapping[value as string];
            // Prisma generates an enum object (imported as BloodTypeEnum here) for its values,
            // and a type (imported as BloodType here) for the enum's possible string values.
            if (mappedBloodType) {
              dataForPrisma.blood = mappedBloodType as BloodType;
            } else {
              // Check if the provided value is already a valid member of the enum
              const enumValues = Object.values(BloodTypeEnum);
              if (enumValues.includes(value as BloodType)) {
                 dataForPrisma.blood = value as BloodType;
              } else {
                console.warn(`Invalid or unmapped blood_type value: ${value}. Ensure it's a valid BloodTypeEnum member or mapped.`);
                // Optionally, you could throw an error here or assign a default/null if appropriate
              }
            }
          } else if (key === 'is_baptized' && value !== undefined && value !== null) {
            dataForPrisma.baptism = value as boolean;
          } else if (key === 'birthday' && typeof value === 'string') {
            dataForPrisma.birthday = this.formatDate(value);
          } else if (key === 'baptism_date' && typeof value === 'string') {
            dataForPrisma.baptism_date = this.formatDate(value);
          } else if (key !== 'country_id' && key !== 'union_id' && key !== 'local_field_id' && key !== 'club_id' && key !== 'user_id' && key !== 'id') {
            // Add other scalar fields, excluding IDs handled as relations and primary/unique keys from DTO
            dataForPrisma[key] = value;
          }
        }
      }
      
      // Validar fechas (using dataForPrisma, which now contains formatted dates)
      if (dataForPrisma.baptism_date && dataForPrisma.birthday) {
        // Dates in dataForPrisma are already Date objects due to formatDate
        const baptismDate = dataForPrisma.baptism_date as Date;
        const birthDate = dataForPrisma.birthday as Date;

        if (baptismDate < birthDate) {
          throw new BadRequestException('Baptism date cannot be before birth date');
        }
      }

      // Handle relational fields by connecting to related entities
      if (updateUserDto.country_id !== undefined && updateUserDto.country_id !== null) {
        // Assuming the unique key on the 'countries' table used for connection is 'country_id'
        dataForPrisma.countries = { connect: { country_id: updateUserDto.country_id } }; 
      }
      if (updateUserDto.union_id !== undefined && updateUserDto.union_id !== null) {
        // Assuming the unique key on the 'unions' table used for connection is 'union_id'
        dataForPrisma.unions = { connect: { union_id: updateUserDto.union_id } }; 
      }
      if (updateUserDto.local_field_id !== undefined && updateUserDto.local_field_id !== null) {
        // Assuming the unique key on the 'local_fields' table used for connection is 'local_field_id'
        dataForPrisma.local_fields = { connect: { local_field_id: updateUserDto.local_field_id } }; 
      }
      // TODO: Verify club relation in schema.prisma. The relation name on the User model and the connection key are unknown.
      // The following is commented out until the correct relation and key are identified.
      /*
      if (updateUserDto.club_id !== undefined && updateUserDto.club_id !== null) {
        // Example: if the relation on User model is 'userClub' and it connects to Club's 'id':
        // dataForPrisma.userClub = { connect: { id: updateUserDto.club_id } };
        // Or if it's via an intermediate table like 'club_role_assignments':
        // dataForPrisma.club_role_assignments = { create: [{ club: { connect: { id: updateUserDto.club_id } }, role: 'MEMBER' }] }; // This is just an example
        console.warn('Club connection is currently disabled. Please update schema.prisma details.');
      }
      */

      dataForPrisma.modified_at = new Date();

      const updatedUser = await this.prisma.users.update({
        where,
        data: dataForPrisma,
      });

      // Invalidar el caché para este usuario después de una actualización exitosa
      const cacheKey = `user-context-${where.user_id}`;
      await this.cacheManager.del(cacheKey);
      // Considera también invalidar cachés relacionados si la actualización afecta otros datos cacheados.

      return {
        status: true,
        message: `User "${updatedUser.name}" updated successfully`,
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Errores específicos de Prisma
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un usuario con alguno de estos datos');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Usuario no encontrado');
        }
        throw new BadRequestException(`Error al actualizar usuario: ${error.message}`);
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Error de validación: ${error.message.split('\n').pop()}`);
      }

      throw new BadRequestException(`Error al actualizar usuario: ${error.message || 'Error desconocido'}`);
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { is_baptized, ...restOfDto } = createUserDto;
      const dataToCreate: Prisma.usersCreateInput = { ...restOfDto };

      if (createUserDto.hasOwnProperty('is_baptized') && typeof createUserDto.is_baptized === 'boolean') {
        dataToCreate.baptism = createUserDto.is_baptized;
      }

      // Formatear fechas
      if (dataToCreate.birthday && typeof dataToCreate.birthday === 'string') {
        dataToCreate.birthday = this.formatDate(dataToCreate.birthday);
      }

      if (dataToCreate.baptism_date && typeof dataToCreate.baptism_date === 'string') {
        dataToCreate.baptism_date = this.formatDate(dataToCreate.baptism_date);
      }

      // Validar fechas
      if (dataToCreate.baptism_date && dataToCreate.birthday) {
        const baptismDate = dataToCreate.baptism_date instanceof Date
          ? dataToCreate.baptism_date
          : new Date(dataToCreate.baptism_date);

        const birthDate = dataToCreate.birthday instanceof Date
          ? dataToCreate.birthday
          : new Date(dataToCreate.birthday);

        if (baptismDate < birthDate) {
          throw new BadRequestException('Baptism date cannot be before birth date');
        }
      }

      const newUser = await this.prisma.users.create({
        data: dataToCreate,
      });

      return {
        status: true,
        message: `User "${newUser.name}" created successfully`,
        user: newUser,
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);

      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un usuario con este nombre o email');
        }
        throw new BadRequestException(`Error al crear usuario: ${error.message}`);
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Error de validación: ${error.message.split('\n').pop()}`);
      }

      throw new BadRequestException(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
    }
  }

  async remove(where: Prisma.usersWhereUniqueInput) {
    await this.findOne(where);

    try {
      await this.prisma.users.update({
        where,
        data: { active: false },
      });
      return {
        status: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      throw new BadRequestException('Unable to soft delete User');
    }
  }

  private async checkDuplicate(field: 'name' | 'email', value: string, currentUserId: string) {
    const whereCondition: any = { active: true };
    whereCondition[field] = value;

    if (currentUserId) {
      whereCondition.NOT = { user_id: currentUserId };
    }

    const existingUser = await this.prisma.users.findFirst({
      where: whereCondition,
    });

    if (existingUser) {
      throw new ConflictException(`User with this ${field} already exists`);
    }
  }

  // NUEVO MÉTODO PARA OBTENER EL CONTEXTO COMPLETO DEL USUARIO
  async getUserContext(userId: string): Promise<any> { 
    const userWithContext = await this.prisma.users.findUnique({
      where: { user_id: userId, active: true },
      // Selecciona campos específicos de la tabla 'users' para 'basicUserInfo'
      select: {
        user_id: true,
        active: true,
        users_roles: { 
          where: { active: true }, 
          include: {
            roles: { 
              include: {
                role_permissions: { 
                  where: { active: true }, 
                  include: {
                    permissions: true, 
                  },
                },
              },
            },
          },
        },
        club_role_assignments: { 
          where: { active: true }, 
          include: {
            roles: {
              include: {
                role_permissions: { 
                  where: { active: true },
                  include: {
                    permissions: {
                      select: { permission_id: true, permission_name: true }
                    },
                  },
                },
              }
            },
            ecclesiastical_year: { 
              select: { year_id: true, start_date: true, end_date: true }
            },
            club_adventurers: { 
              include: {
                clubs: {
                  select: { club_id: true, name: true } 
                },
                club_types: { 
                  select: { ct_id: true, name: true }
                }
              }
            },
            club_pathfinders: { 
              include: {
                clubs: {
                  select: { club_id: true, name: true }
                },
                club_types: { 
                  select: { ct_id: true, name: true }
                }
              }
            },
            club_master_guild: { 
              include: {
                clubs: {
                  select: { club_id: true, name: true }
                },
                club_types: { 
                  select: { ct_id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!userWithContext) {
      throw new NotFoundException(`User with ID ${userId} not found or is inactive.`);
    }

    // Procesamiento de global_roles (igual que antes)
    const globalRoles = userWithContext.users_roles?.map(ur => ({
      role_id: ur.roles.role_id,
      role_name: ur.roles.role_name,
      role_category: ur.roles.role_category, // Added role_category from the original role
      permissions: ur.roles.role_permissions.map(rp => rp.permissions.permission_name),
    })) || [];

    // Procesamiento de club_assignments (igual que antes)
    const clubAssignments = userWithContext.club_role_assignments?.map(cra => {
      let instanceDetails: any = {};
      let instanceType: string = '';
      if (cra.club_adventurers) {
        instanceDetails = {
          instance_id: cra.club_adventurers.club_adv_id,
          instance_active: cra.club_adventurers.active,
          main_club_id: cra.club_adventurers.clubs.club_id,
          main_club_name: cra.club_adventurers.clubs.name,
          instance_club_type: cra.club_adventurers.club_types.name,
        };
        instanceType = 'Adventurer';
      } else if (cra.club_pathfinders) {
        instanceDetails = {
          instance_id: cra.club_pathfinders.club_pathf_id,
          instance_active: cra.club_pathfinders.active,
          main_club_id: cra.club_pathfinders.clubs.club_id,
          main_club_name: cra.club_pathfinders.clubs.name,
          instance_club_type: cra.club_pathfinders.club_types.name,
        };
        instanceType = 'Pathfinder';
      } else if (cra.club_master_guild) {
        instanceDetails = {
          instance_id: cra.club_master_guild.club_mg_id,
          instance_active: cra.club_master_guild.active,
          main_club_id: cra.club_master_guild.clubs.club_id,
          main_club_name: cra.club_master_guild.clubs.name,
          instance_club_type: cra.club_master_guild.club_types.name,
        };
        instanceType = 'MasterGuide';
      }

      const clubRolePermissions = cra.roles.role_permissions?.map(rp => rp.permissions.permission_name) || [];

      return {
        assignment_id: cra.assignment_id,
        user_id: cra.user_id, // Este user_id es de la tabla de asignación, el principal ya está
        club_role_id: cra.roles.role_id,
        club_role_name: cra.roles.role_name,
        club_role_category: cra.roles.role_category,
        permissions: clubRolePermissions,
        ecclesiastical_year: {
            year_id: cra.ecclesiastical_year.year_id,
            start_date: cra.ecclesiastical_year.start_date,
            end_date: cra.ecclesiastical_year.end_date,
        },
        start_date: cra.start_date,
        end_date: cra.end_date,
        assignment_active: cra.active,
        instance_type: instanceType,
        ...instanceDetails,
      };
    }) || [];

    // 'userWithContext' ahora solo tiene los campos seleccionados explícitamente de 'users'
    // y las relaciones 'users_roles' y 'club_role_assignments'.
    // Extraemos las relaciones para devolver solo los campos base del usuario.
    const { users_roles, club_role_assignments, ...basicUserInfo } = userWithContext;

    return {
      ...basicUserInfo, // Esto contendrá solo los campos seleccionados en el 'select' de Prisma
      global_roles: globalRoles,
      club_assignments: clubAssignments,
    };
  }
}