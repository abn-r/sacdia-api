import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Clubs } from './clubs.model';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async create(createClubDto: Prisma.clubsCreateInput) {
    if (!createClubDto.name || !createClubDto.local_fields || !createClubDto.districts || !createClubDto.churches)
      throw new BadRequestException({ status: false, message: 'Name, local field, district and church are required' });

    const localFieldId = (createClubDto.local_fields as any).connect?.local_field_id;
    const districtId = (createClubDto.districts as any).connect?.district_id;
    const churchId = (createClubDto.churches as any).connect?.church_id;

    if (!localFieldId || !districtId || !churchId) {
      throw new BadRequestException({ status: false, message: 'Valid local field, district and church IDs are required' });
    }

    // Verificar que las entidades relacionadas existen
    const [localField, district, church] = await Promise.all([
      this.prisma.local_fields.findUnique({ where: { local_field_id: localFieldId } }),
      this.prisma.districts.findUnique({ where: { district_id: districtId } }),
      this.prisma.churches.findUnique({ where: { church_id: churchId } })
    ]);

    if (!localField) {
      throw new NotFoundException({ status: false, message: `Local field with ID ${localFieldId} not found` });
    }
    if (!district) {
      throw new NotFoundException({ status: false, message: `District with ID ${districtId} not found` });
    }
    if (!church) {
      throw new NotFoundException({ status: false, message: `Church with ID ${churchId} not found` });
    }

    // Validar que no exista otro club con el mismo nombre
    const existingClub = await this.prisma.clubs.findFirst({
      where: { name: createClubDto.name }
    });

    if (existingClub) {
      throw new ConflictException({
        status: false,
        message: 'Club with this name already exists'
      });
    }

    try {
      const clubData: Prisma.clubsCreateInput = {
        name: createClubDto.name,
        description: createClubDto.description,
        active: createClubDto.active !== undefined ? createClubDto.active : true,
        address: createClubDto.address,
        coordinates: createClubDto.coordinates || {},
        local_fields: createClubDto.local_fields,
        districts: createClubDto.districts,
        churches: createClubDto.churches,
      };

      const newClub = await this.prisma.clubs.create({
        data: clubData as Prisma.clubsCreateArgs['data'],
      });

      await this.cacheManager.del(`clubs_list_*`);
      await this.cacheManager.del(`local_field_${localFieldId}_clubs`);
      await this.cacheManager.del(`district_${districtId}_clubs`);
      await this.cacheManager.del(`church_${churchId}_clubs`);

      return { status: true, message: 'Club container created successfully', data: newClub };
    } catch (error) {
      this.logger.error('Error to create club, invalid data', error);
      throw new BadRequestException({ status: false, message: 'Error to create club, invalid data' });
    }
  }

  async createAdventurerInstance(
    dto: Prisma.club_adventurersUncheckedCreateInput 
  ) {
    // Verificar que el club contenedor (main club) existe
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

    // Verificar que el club_type_id para Aventureros existe
    const clubType = await this.prisma.club_types.findUnique({
      where: { ct_id: dto.club_type_id }
    });
    
    if (!clubType) {
      throw new NotFoundException(`ClubType for Adventurers with ID ${dto.club_type_id} not found.`);
    }

    try {
      const newInstance = await this.prisma.club_adventurers.create({
        data: dto
      });

      await this.cacheManager.del(`club_${dto.main_club_id}`);
      await this.cacheManager.del(`clubs_list_*`); 

      return { status: true, message: 'Adventurer club instance created successfully', data: newInstance };
    } catch (error) {
      this.logger.error('Error creating adventurer club instance', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Adventurer club instance already exists or conflict with unique fields.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.error('Foreign key constraint failed on createAdventurerInstance', error.meta);
        throw new BadRequestException(`Invalid main_club_id or club_type_id provided. Check if they exist.`);
      }
      throw new InternalServerErrorException('Error creating adventurer club instance');
    }
  }

  async createPathfinderInstance(
    dto: Prisma.club_pathfindersUncheckedCreateInput
  ) {
    // Verificar que el club contenedor (main club) existe
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

    // Verificar que el club_type_id existe
    const clubType = await this.prisma.club_types.findUnique({
      where: { ct_id: dto.club_type_id }
    });
    if (!clubType) {
      throw new NotFoundException(`ClubType with ID ${dto.club_type_id} not found for Pathfinders.`);
    }
    // Opcional: Validar clubType.name si es necesario

    try {
      const newInstance = await this.prisma.club_pathfinders.create({
        data: dto
      });

      await this.cacheManager.del(`club_${dto.main_club_id}`);
      await this.cacheManager.del(`clubs_list_*`); 

      return { status: true, message: 'Pathfinder club instance created successfully', data: newInstance };
    } catch (error) {
      this.logger.error('Error creating pathfinder club instance', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Pathfinder club instance already exists or conflict with unique fields.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.error('Foreign key constraint failed on createPathfinderInstance', error.meta);
        throw new BadRequestException(`Invalid main_club_id or club_type_id provided. Check if they exist.`);
      }
      throw new InternalServerErrorException('Error creating pathfinder club instance');
    }
  }

  async createMasterGuideInstance(
    dto: Prisma.club_master_guildUncheckedCreateInput
  ) {
    // Verificar que el club contenedor (main club) existe
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

    // Verificar que el club_type_id existe
    const clubType = await this.prisma.club_types.findUnique({
      where: { ct_id: dto.club_type_id }
    });
    if (!clubType) {
      throw new NotFoundException(`ClubType with ID ${dto.club_type_id} not found for Master Guides.`);
    }
    // Opcional: Validar clubType.name si es necesario

    try {
      const newInstance = await this.prisma.club_master_guild.create({
        data: dto
      });

      await this.cacheManager.del(`club_${dto.main_club_id}`);
      await this.cacheManager.del(`clubs_list_*`); 

      return { status: true, message: 'Master Guide club instance created successfully', data: newInstance };
    } catch (error) {
      this.logger.error('Error creating master guide club instance', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Master Guide club instance already exists or conflict with unique fields.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.error('Foreign key constraint failed on createMasterGuideInstance', error.meta);
        throw new BadRequestException(`Invalid main_club_id or club_type_id provided. Check if they exist.`);
      }
      throw new InternalServerErrorException('Error creating master guide club instance');
    }
  }

  async assignRoleToClubInstance(
    dto: Prisma.club_role_assignmentsUncheckedCreateInput, // Usamos Unchecked para FKs directas
    autoAssignMemberRole: boolean = false // Nuevo parámetro para asignar automáticamente rol member
  ) {
    // 1. Validar que solo una de las FKs de instancia de club esté presente
    const instanceIds = [dto.club_adv_id, dto.club_pathf_id, dto.club_mg_id];
    const providedInstanceIds = instanceIds.filter(id => id != null);

    if (providedInstanceIds.length === 0) {
      throw new BadRequestException('One club instance ID (club_adv_id, club_pathf_id, or club_mg_id) must be provided.');
    }
    if (providedInstanceIds.length > 1) {
      throw new BadRequestException('Only one club instance ID can be provided for a role assignment.');
    }

    let role;
    
    // 2. Si autoAssignMemberRole es true, buscar el rol member automáticamente
    if (autoAssignMemberRole) {
      role = await this.prisma.roles.findFirst({
        where: { 
          role_name: 'member',
          active: true,
          role_category: 'CLUB'
        },
        select: { role_id: true, role_category: true, role_name: true },
      });

      if (!role) {
        throw new NotFoundException('Member role not found in the system');
      }
      
      // Asignar el role_id encontrado al dto
      dto.role_id = role.role_id;
    } else {
      // 2. Validar que el role_id corresponda a un rol de categoría 'CLUB'
      role = await this.prisma.roles.findUnique({
        where: { role_id: dto.role_id },
        select: { role_category: true, role_name: true },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${dto.role_id} not found.`);
      }
      if (role.role_category !== 'CLUB') {
        throw new BadRequestException(`Role "${role.role_name}" (ID: ${dto.role_id}) is not a CLUB role and cannot be assigned to a club instance.`);
      }
    }

    // 3. Validar que el usuario exista (opcional, pero buena práctica)
    const user = await this.prisma.users.findUnique({ where: { user_id: dto.user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found.`);
    }

    // 4. Validar que la instancia de club específica exista
    if (dto.club_adv_id) {
      const instance = await this.prisma.club_adventurers.findUnique({ where: { club_adv_id: dto.club_adv_id } });
      if (!instance) throw new NotFoundException(`Adventurer club instance with ID ${dto.club_adv_id} not found.`);
    } else if (dto.club_pathf_id) {
      const instance = await this.prisma.club_pathfinders.findUnique({ where: { club_pathf_id: dto.club_pathf_id } });
      if (!instance) throw new NotFoundException(`Pathfinder club instance with ID ${dto.club_pathf_id} not found.`);
    } else if (dto.club_mg_id) {
      const instance = await this.prisma.club_master_guild.findUnique({ where: { club_mg_id: dto.club_mg_id } });
      if (!instance) throw new NotFoundException(`Master Guide club instance with ID ${dto.club_mg_id} not found.`);
    }
    
    // 5. Validar que ecclesiastical_year_id exista
    const year = await this.prisma.ecclesiastical_year.findUnique({ where: { year_id: dto.ecclesiastical_year_id }});
    if (!year) {
        throw new NotFoundException(`Ecclesiastical year with ID ${dto.ecclesiastical_year_id} not found.`);
    }

    // Convertir fechas de string a Date si es necesario (si el DTO las envía como string)
    // Prisma UncheckedCreateInput espera los tipos correctos (Date para campos Date)
    // Si el DTO `AssignClubRoleDto` se usa en el controlador con `IsDateString`,
    // se necesitaría una transformación aquí o en el pipe del controlador.
    // Por ahora, asumimos que `dto` ya tiene los tipos correctos si viene de un DTO validado y transformado.
    // dto.start_date = new Date(dto.start_date);
    // if (dto.end_date) dto.end_date = new Date(dto.end_date);

    try {
      const newAssignment = await this.prisma.club_role_assignments.create({
        data: {
            user_id: dto.user_id,
            role_id: dto.role_id,
            club_adv_id: dto.club_adv_id,
            club_pathf_id: dto.club_pathf_id,
            club_mg_id: dto.club_mg_id,
            ecclesiastical_year_id: dto.ecclesiastical_year_id,
            start_date: new Date(dto.start_date), // Asegurar que sea un objeto Date
            end_date: dto.end_date ? new Date(dto.end_date) : null, // Asegurar que sea Date o null
            active: dto.active === undefined ? true : dto.active,
        },
      });

      // Invalidar cachés relevantes si es necesario (ej. caché de roles de usuario)
      // await this.cacheManager.del(`user_roles_${dto.user_id}`);

      return { status: true, message: 'Role assigned to club instance successfully', data: newAssignment };
    } catch (error) {
      this.logger.error('Error assigning role to club instance', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // P2002 puede ocurrir por la restricción @@unique en club_role_assignments
        throw new ConflictException('This role assignment already exists for the user in this club instance and period, or conflicts with another unique constraint.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.error('Foreign key constraint failed on assignRoleToClubInstance', error.meta);
        throw new BadRequestException(`Invalid user_id, role_id, club instance ID, or ecclesiastical_year_id provided. Check if they exist.`);
      }
      throw new InternalServerErrorException('Error assigning role to club instance');
    }
  }

  async createMany(clubs: Prisma.clubsCreateInput[]): Promise<{ status: boolean, message: string, count: number }> {
    try {
      // Como Prisma no permite createMany con relaciones, debemos procesar cada entrada manualmente
      let count = 0;
      const localFieldIds = new Set<number>();
      const districtIds = new Set<number>();
      const churchIds = new Set<number>();

      for (const club of clubs) {
        if (!club.name || !club.local_fields || !club.districts || !club.churches) {
          continue;
        }

        const localFieldId = (club.local_fields as any).connect?.local_field_id;
        const districtId = (club.districts as any).connect?.district_id;
        const churchId = (club.churches as any).connect?.church_id;

        if (!localFieldId || !districtId || !churchId) {
          continue;
        }

        const existingClub = await this.prisma.clubs.findFirst({
          where: { name: club.name }
        });

        if (existingClub) {
          continue;
        }

        await this.prisma.clubs.create({
          data: {
            name: club.name,
            description: club.description,
            active: club.active !== undefined ? club.active : true,
            address: club.address,
            coordinates: club.coordinates || {},
            local_fields: club.local_fields,
            districts: club.districts,
            churches: club.churches,
          }
        });

        localFieldIds.add(localFieldId);
        districtIds.add(districtId);
        churchIds.add(churchId);
        count++;
      }

      await this.cacheManager.del('clubs_list_*');
      
      for (const localFieldId of localFieldIds) {
        await this.cacheManager.del(`local_field_${localFieldId}_clubs`);
      }
      
      for (const districtId of districtIds) {
        await this.cacheManager.del(`district_${districtId}_clubs`);
      }
      
      for (const churchId of churchIds) {
        await this.cacheManager.del(`church_${churchId}_clubs`);
      }

      return {
        status: true,
        message: 'Clubs created successfully',
        count
      };
    } catch (error) {
      this.logger.error('Error creating multiple clubs', error);
      throw new BadRequestException({
        status: false,
        message: 'Error creating clubs'
      });
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.clubsWhereUniqueInput;
    where?: Prisma.clubsWhereInput;
    orderBy?: Prisma.clubsOrderByWithRelationInput;
  }): Promise<{ status: boolean, data: any[], total: number, nextCursor?: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const cacheKey = `clubs_list_${JSON.stringify(params)}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[], total: number, nextCursor?: number };

    const [result, total] = await Promise.all([
      this.prisma.clubs.findMany({
        skip,
        take: take ? take + 1 : undefined,
        cursor,
        where: { ...where, active: true },
        orderBy: orderBy || { club_id: 'asc' },
        include: {
          local_fields: {
            select: {
              local_field_id: true,
              name: true
            }
          },
          districts: {
            select: {
              district_id: true,
              name: true
            }
          },
          churches: {
            select: {
              church_id: true,
              name: true
            }
          },
          club_adventurers: {
            select: {
              club_adv_id: true,
              active: true
            }
          },
          club_pathfinders: {
            select: {
              club_pathf_id: true,
              active: true
            }
          },
          club_master_guild: {
            select: {
              club_mg_id: true,
              active: true
            }
          }
        }
      }),
      this.prisma.clubs.count({
        where: { ...where, active: true }
      })
    ]);

    let nextCursor = undefined;
    if (take && result.length > take) {
      const nextItem = result.pop();
      nextCursor = nextItem.club_id;
    }

    const response = {
      status: true,
      data: result,
      total,
      nextCursor
    };

    await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora

    return response;
  }

  async findOne(id: number): Promise<{ status: boolean, data: any }> {
    const cacheKey = `club_${id}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any };

    const club = await this.prisma.clubs.findUnique({
      where: { club_id: id },
      include: {
        local_fields: {
          select: {
            local_field_id: true,
            name: true
          }
        },
        districts: {
          select: {
            district_id: true,
            name: true
          }
        },
        churches: {
          select: {
            church_id: true,
            name: true
          }
        },
        club_adventurers: {
          select: {
            club_adv_id: true,
            active: true,
            meeting_day: true,
            meeting_time: true
          }
        },
        club_pathfinders: {
          select: {
            club_pathf_id: true,
            active: true,
            meeting_day: true,
            meeting_time: true
          }
        },
        club_master_guild: {
          select: {
            club_mg_id: true,
            active: true,
            meeting_day: true,
            meeting_time: true
          }
        }
      }
    });

    if (!club) throw new NotFoundException({ status: false, message: `Club with ID ${id} not found` });

    const result = { status: true, data: club };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByLocalField(localFieldId: number): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `local_field_${localFieldId}_clubs`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el local_field existe
    const localField = await this.prisma.local_fields.findUnique({
      where: { local_field_id: localFieldId }
    });

    if (!localField) {
      throw new NotFoundException({ status: false, message: `Local field with ID ${localFieldId} not found` });
    }

    const clubs = await this.prisma.clubs.findMany({
      where: {
        local_field_id: localFieldId,
        active: true
      },
      include: {
        districts: {
          select: {
            district_id: true,
            name: true
          }
        },
        churches: {
          select: {
            church_id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const result = { status: true, data: clubs };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByDistrict(districtId: number): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `district_${districtId}_clubs`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que el distrito existe
    const district = await this.prisma.districts.findUnique({
      where: { district_id: districtId }
    });

    if (!district) {
      throw new NotFoundException({ status: false, message: `District with ID ${districtId} not found` });
    }

    const clubs = await this.prisma.clubs.findMany({
      where: {
        district_id: districtId,
        active: true
      },
      include: {
        local_fields: {
          select: {
            local_field_id: true,
            name: true
          }
        },
        churches: {
          select: {
            church_id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const result = { status: true, data: clubs };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async findByChurch(churchId: number): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `church_${churchId}_clubs`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    // Verificar que la iglesia existe
    const church = await this.prisma.churches.findUnique({
      where: { church_id: churchId }
    });

    if (!church) {
      throw new NotFoundException({ status: false, message: `Church with ID ${churchId} not found` });
    }

    const clubs = await this.prisma.clubs.findMany({
      where: {
        church_id: churchId,
        active: true
      },
      include: {
        local_fields: {
          select: {
            local_field_id: true,
            name: true
          }
        },
        districts: {
          select: {
            district_id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const result = { status: true, data: clubs };
    await this.cacheManager.set(cacheKey, result, 3600000); // 1 hora
    return result;
  }

  async search(term: string): Promise<{ status: boolean, data: any[] }> {
    const cacheKey = `clubs_search_${term}`;
    let cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) return cachedResult as { status: boolean, data: any[] };

    const results = await this.prisma.clubs.findMany({
      where: {
        name: { contains: term, mode: 'insensitive' },
        active: true
      },
      include: {
        local_fields: {
          select: {
            local_field_id: true,
            name: true
          }
        },
        districts: {
          select: {
            district_id: true,
            name: true
          }
        },
        churches: {
          select: {
            church_id: true,
            name: true
          }
        }
      },
      take: 50
    });

    const response = { status: true, data: results };
    await this.cacheManager.set(cacheKey, response, 3600000); // 1 hora

    return response;
  }

  async update(id: number, updateClubDto: Prisma.clubsUpdateInput): Promise<{ status: boolean, data: any }> {
    const club = await this.prisma.clubs.findUnique({
      where: { club_id: id }
    });

    if (!club) {
      throw new NotFoundException({ status: false, message: `Club with ID ${id} not found` });
    }

    // Si se está cambiando el nombre, verificar que no exista otro club con ese nombre
    if (updateClubDto.name) {
      const existingClub = await this.prisma.clubs.findFirst({
        where: {
          name: updateClubDto.name as string,
          NOT: { club_id: id }
        }
      });

      if (existingClub) {
        throw new ConflictException({ status: false, message: 'Club with this name already exists' });
      }
    }

    const updatedClub = await this.prisma.clubs.update({
      where: { club_id: id },
      data: {
        ...updateClubDto,
        modified_at: new Date()
      },
      include: {
        local_fields: {
          select: {
            local_field_id: true,
            name: true
          }
        },
        districts: {
          select: {
            district_id: true,
            name: true
          }
        },
        churches: {
          select: {
            church_id: true,
            name: true
          }
        },
        club_adventurers: {
          select: {
            club_adv_id: true,
            active: true
          }
        },
        club_pathfinders: {
          select: {
            club_pathf_id: true,
            active: true
          }
        },
        club_master_guild: {
          select: {
            club_mg_id: true,
            active: true
          }
        }
      }
    });

    await this.cacheManager.del(`club_${id}`);
    await this.cacheManager.del(`clubs_list_*`);
    await this.cacheManager.del(`local_field_${club.local_field_id}_clubs`);
    await this.cacheManager.del(`district_${club.district_id}_clubs`);
    await this.cacheManager.del(`church_${club.church_id}_clubs`);
    
    // Si cambió alguna relación, invalidar las cachés correspondientes
    if (updateClubDto.local_fields) {
      const newLocalFieldId = (updateClubDto.local_fields as any).connect?.local_field_id;
      if (newLocalFieldId && newLocalFieldId !== club.local_field_id) {
        await this.cacheManager.del(`local_field_${newLocalFieldId}_clubs`);
      }
    }
    
    if (updateClubDto.districts) {
      const newDistrictId = (updateClubDto.districts as any).connect?.district_id;
      if (newDistrictId && newDistrictId !== club.district_id) {
        await this.cacheManager.del(`district_${newDistrictId}_clubs`);
      }
    }
    
    if (updateClubDto.churches) {
      const newChurchId = (updateClubDto.churches as any).connect?.church_id;
      if (newChurchId && newChurchId !== club.church_id) {
        await this.cacheManager.del(`church_${newChurchId}_clubs`);
      }
    }

    return { status: true, data: updatedClub };
  }

  async softDelete(id: number): Promise<{ status: boolean, message: string }> {
    try {
      const club = await this.prisma.clubs.findUnique({
        where: { club_id: id }
      });

      if (!club) {
        throw new NotFoundException({ status: false, message: `Club with ID ${id} not found` });
      }

      await this.prisma.clubs.update({
        where: { club_id: id },
        data: {
          active: false,
          modified_at: new Date()
        }
      });

      await this.cacheManager.del(`club_${id}`);
      await this.cacheManager.del(`clubs_list_*`);
      await this.cacheManager.del(`local_field_${club.local_field_id}_clubs`);
      await this.cacheManager.del(`district_${club.district_id}_clubs`);
      await this.cacheManager.del(`church_${club.church_id}_clubs`);

      return { status: true, message: 'Club deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      this.logger.error('Error deleting club', error);
      throw new BadRequestException({ status: false, message: 'Error deleting club' });
    }
  }

  async getClubTypes(clubId: number): Promise<{ status: boolean, data: any }> {
    try {
      // Verificar que el club principal existe
      const mainClub = await this.prisma.clubs.findUnique({
        where: { club_id: clubId },
        select: { club_id: true, name: true, active: true }
      });

      if (!mainClub) {
        throw new NotFoundException({ status: false, message: `Club with ID ${clubId} not found` });
      }

      if (!mainClub.active) {
        throw new BadRequestException({ status: false, message: `Club with ID ${clubId} is not active` });
      }

      const clubTypes = [];

      // Consultar club_adventurers
      const adventurersClub = await this.prisma.club_adventurers.findFirst({
        where: { 
          main_club_id: clubId,
          active: true 
        },
        include: {
          club_types: {
            select: { name: true }
          }
        }
      });

      if (adventurersClub) {
        clubTypes.push({
          id: adventurersClub.club_adv_id,
          type: 'adventurers',
          type_name: adventurersClub.club_types.name,
          active: adventurersClub.active,
          souls_target: adventurersClub.souls_target,
          fee: adventurersClub.fee,
          meeting_day: adventurersClub.meeting_day,
          meeting_time: adventurersClub.meeting_time
        });
      }

      // Consultar club_pathfinders
      const pathfindersClub = await this.prisma.club_pathfinders.findFirst({
        where: { 
          main_club_id: clubId,
          active: true 
        },
        include: {
          club_types: {
            select: { name: true }
          }
        }
      });

      if (pathfindersClub) {
        clubTypes.push({
          id: pathfindersClub.club_pathf_id,
          type: 'pathfinders',
          type_name: pathfindersClub.club_types.name,
          active: pathfindersClub.active,
          souls_target: pathfindersClub.souls_target,
          fee: pathfindersClub.fee,
          meeting_day: pathfindersClub.meeting_day,
          meeting_time: pathfindersClub.meeting_time
        });
      }

      // Consultar club_master_guild
      const masterGuildClub = await this.prisma.club_master_guild.findFirst({
        where: { 
          main_club_id: clubId,
          active: true 
        },
        include: {
          club_types: {
            select: { name: true }
          }
        }
      });

      if (masterGuildClub) {
        clubTypes.push({
          id: masterGuildClub.club_mg_id,
          type: 'master_guild',
          type_name: masterGuildClub.club_types.name,
          active: masterGuildClub.active,
          souls_target: masterGuildClub.souls_target,
          fee: masterGuildClub.fee,
          meeting_day: masterGuildClub.meeting_day,
          meeting_time: masterGuildClub.meeting_time
        });
      }

      return {
        status: true,
        data: {
          main_club: {
            id: mainClub.club_id,
            name: mainClub.name
          },
          club_types: clubTypes
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Error getting club types for club ${clubId}`, error);
      throw new InternalServerErrorException({ 
        status: false, 
        message: 'Error retrieving club types' 
      });
    }
  }

  async assignUserToClub(assignmentData: {
    userId: string;
    clubType: 'adventurers' | 'pathfinders' | 'master_guild';
    clubTypeId: number;
    ecclesiasticalYearId: number;
    startDate: Date;
    endDate: Date;
  }): Promise<{ status: boolean, data?: any, message?: string }> {
    try {
      // Buscar el rol "member" en la base de datos
      const memberRole = await this.prisma.roles.findFirst({
        where: { 
          role_name: 'member',
          active: true 
        }
      });

      if (!memberRole) {
        throw new NotFoundException({ 
          status: false, 
          message: 'Member role not found in the system' 
        });
      }

      // Verificar que el usuario existe
      const user = await this.prisma.users.findUnique({
        where: { user_id: assignmentData.userId },
        select: { user_id: true, active: true }
      });

      if (!user) {
        throw new NotFoundException({ 
          status: false, 
          message: `User with ID ${assignmentData.userId} not found` 
        });
      }

      if (!user.active) {
        throw new BadRequestException({ 
          status: false, 
          message: `User with ID ${assignmentData.userId} is not active` 
        });
      }

      // Verificar que el año eclesiástico existe y está activo
      const ecclesiasticalYear = await this.prisma.ecclesiastical_year.findUnique({
        where: { year_id: assignmentData.ecclesiasticalYearId },
        select: { year_id: true, active: true }
      });

      if (!ecclesiasticalYear) {
        throw new NotFoundException({ 
          status: false, 
          message: `Ecclesiastical year with ID ${assignmentData.ecclesiasticalYearId} not found` 
        });
      }

      if (!ecclesiasticalYear.active) {
        throw new BadRequestException({ 
          status: false, 
          message: `Ecclesiastical year with ID ${assignmentData.ecclesiasticalYearId} is not active` 
        });
      }

      // Verificar que el club específico existe y está activo
      let clubExists = false;
      let clubAssignmentData: any = {
        user_id: assignmentData.userId,
        role_id: memberRole.role_id,
        ecclesiastical_year_id: assignmentData.ecclesiasticalYearId,
        start_date: assignmentData.startDate,
        end_date: assignmentData.endDate,
        active: true
      };

      switch (assignmentData.clubType) {
        case 'adventurers':
          const adventurersClub = await this.prisma.club_adventurers.findUnique({
            where: { club_adv_id: assignmentData.clubTypeId },
            select: { club_adv_id: true, active: true }
          });
          
          if (!adventurersClub) {
            throw new NotFoundException({ 
              status: false, 
              message: `Adventurers club with ID ${assignmentData.clubTypeId} not found` 
            });
          }
          
          if (!adventurersClub.active) {
            throw new BadRequestException({ 
              status: false, 
              message: `Adventurers club with ID ${assignmentData.clubTypeId} is not active` 
            });
          }
          
          clubAssignmentData.club_adv_id = assignmentData.clubTypeId;
          clubExists = true;
          break;

        case 'pathfinders':
          const pathfindersClub = await this.prisma.club_pathfinders.findUnique({
            where: { club_pathf_id: assignmentData.clubTypeId },
            select: { club_pathf_id: true, active: true }
          });
          
          if (!pathfindersClub) {
            throw new NotFoundException({ 
              status: false, 
              message: `Pathfinders club with ID ${assignmentData.clubTypeId} not found` 
            });
          }
          
          if (!pathfindersClub.active) {
            throw new BadRequestException({ 
              status: false, 
              message: `Pathfinders club with ID ${assignmentData.clubTypeId} is not active` 
            });
          }
          
          clubAssignmentData.club_pathf_id = assignmentData.clubTypeId;
          clubExists = true;
          break;

        case 'master_guild':
          const masterGuildClub = await this.prisma.club_master_guild.findUnique({
            where: { club_mg_id: assignmentData.clubTypeId },
            select: { club_mg_id: true, active: true }
          });
          
          if (!masterGuildClub) {
            throw new NotFoundException({ 
              status: false, 
              message: `Master Guild club with ID ${assignmentData.clubTypeId} not found` 
            });
          }
          
          if (!masterGuildClub.active) {
            throw new BadRequestException({ 
              status: false, 
              message: `Master Guild club with ID ${assignmentData.clubTypeId} is not active` 
            });
          }
          
          clubAssignmentData.club_mg_id = assignmentData.clubTypeId;
          clubExists = true;
          break;

        default:
          throw new BadRequestException({ 
            status: false, 
            message: 'Invalid club type. Must be adventurers, pathfinders, or master_guild' 
          });
      }

      if (!clubExists) {
        throw new BadRequestException({ 
          status: false, 
          message: 'Club validation failed' 
        });
      }

      // Verificar si ya existe una asignación activa para este usuario en este club y año eclesiástico
      const existingAssignment = await this.prisma.club_role_assignments.findFirst({
        where: {
          user_id: assignmentData.userId,
          role_id: memberRole.role_id,
          club_adv_id: clubAssignmentData.club_adv_id || null,
          club_pathf_id: clubAssignmentData.club_pathf_id || null,
          club_mg_id: clubAssignmentData.club_mg_id || null,
          ecclesiastical_year_id: assignmentData.ecclesiasticalYearId,
          active: true
        }
      });

      if (existingAssignment) {
        throw new ConflictException({ 
          status: false, 
          message: 'User is already assigned to this club for the specified ecclesiastical year' 
        });
      }

      // Crear la asignación
      const assignment = await this.prisma.club_role_assignments.create({
        data: clubAssignmentData,
        include: {
          users: {
            select: {
              user_id: true,
              name: true,
              paternal_last_name: true,
              mother_last_name: true,
              email: true
            }
          },
          roles: {
            select: {
              role_id: true,
              role_name: true
            }
          },
          club_adventurers: clubAssignmentData.club_adv_id ? {
            select: {
              club_adv_id: true,
              clubs: {
                select: {
                  club_id: true,
                  name: true
                }
              }
            }
          } : undefined,
          club_pathfinders: clubAssignmentData.club_pathf_id ? {
            select: {
              club_pathf_id: true,
              clubs: {
                select: {
                  club_id: true,
                  name: true
                }
              }
            }
          } : undefined,
          club_master_guild: clubAssignmentData.club_mg_id ? {
            select: {
              club_mg_id: true,
              clubs: {
                select: {
                  club_id: true,
                  name: true
                }
              }
            }
          } : undefined,
          ecclesiastical_year: {
            select: {
              year_id: true,
              start_date: true,
              end_date: true
            }
          }
        }
      });

      return {
        status: true,
        data: assignment,
        message: 'User successfully assigned to club with member role'
      };

    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException || 
          error instanceof ConflictException) {
        throw error;
      }
      
      this.logger.error('Error assigning user to club', error);
      throw new InternalServerErrorException({ 
        status: false, 
        message: 'Error assigning user to club' 
      });
    }
  }
}