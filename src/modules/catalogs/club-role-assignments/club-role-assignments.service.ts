import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    Logger,
    ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateClubRoleAssignmentDto } from './dto/create-club-role-assignment.dto';
import { UpdateClubRoleAssignmentDto } from './dto/update-club-role-assignment.dto';
import { FindClubRoleAssignmentsQueryDto } from './dto/find-club-role-assignments-query.dto';

/**
 * Servicio para gestionar las asignaciones de roles de club.
 * Proporciona métodos para crear, leer, actualizar y eliminar asignaciones de roles.
 */
@Injectable()
export class ClubRoleAssignmentsService {
    private readonly logger = new Logger(ClubRoleAssignmentsService.name);

    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crea una nueva asignación de rol de club.
     * Valida que solo se proporcione una instancia de club (aventureros, conquistadores o guías mayores).
     * Verifica la existencia del usuario, rol (debe ser de categoría CLUB) y año eclesiástico.
     * Verifica la existencia de la instancia de club específica.
     * Previene la creación de asignaciones duplicadas activas para el mismo usuario, rol, instancia de club y año eclesiástico.
     * @param createClubRoleAssignmentDto - Datos para crear la asignación de rol.
     * @returns La asignación de rol creada.
     * @throws {BadRequestException} Si los datos de entrada son inválidos o falta información.
     * @throws {NotFoundException} Si alguna entidad relacionada (usuario, rol, año eclesiástico, instancia de club) no se encuentra.
     * @throws {ConflictException} Si ya existe una asignación activa con los mismos parámetros.
     */
    async create(createClubRoleAssignmentDto: CreateClubRoleAssignmentDto) {
        const {
            user_id,
            role_id,
            club_adv_id,
            club_pathf_id,
            club_mg_id,
            ecclesiastical_year_id,
            start_date,
            active
        } = createClubRoleAssignmentDto;

        // Validar que solo uno de los IDs de instancia de club esté presente
        const clubInstanceIds = [club_adv_id, club_pathf_id, club_mg_id].filter(id => id !== undefined && id !== null);
        if (clubInstanceIds.length === 0) {
            throw new BadRequestException('Se debe proporcionar al menos un ID de instancia de club (club_adv_id, club_pathf_id, o club_mg_id).');
        }
        if (clubInstanceIds.length > 1) {
            throw new BadRequestException('Solo se puede proporcionar un ID de instancia de club (club_adv_id, club_pathf_id, o club_mg_id) a la vez.');
        }

        try {
            // Verificar que las entidades relacionadas existen
            const user = await this.prisma.users.findUnique({ where: { user_id } });
            if (!user) throw new NotFoundException(`Usuario con ID ${user_id} no encontrado`);

            const role = await this.prisma.roles.findUnique({ where: { role_id } });
            if (!role) throw new NotFoundException(`Rol con ID ${role_id} no encontrado`);
            if (role.role_category !== 'CLUB') {
                throw new BadRequestException(`El rol con ID ${role_id} no es de categoría CLUB y no puede ser asignado a una instancia de club.`);
            }

            const ecclesiasticalYear = await this.prisma.ecclesiastical_year.findUnique({ where: { year_id: ecclesiastical_year_id } });
            if (!ecclesiasticalYear) throw new NotFoundException(`Año Eclesiástico con ID ${ecclesiastical_year_id} no encontrado`);

            // Verificar la instancia de club específica
            if (club_adv_id) {
                const clubInstance = await this.prisma.club_adventurers.findUnique({ where: { club_adv_id } });
                if (!clubInstance) throw new NotFoundException(`Instancia de Club de Aventureros con ID ${club_adv_id} no encontrada`);
            } else if (club_pathf_id) {
                const clubInstance = await this.prisma.club_pathfinders.findUnique({ where: { club_pathf_id } });
                if (!clubInstance) throw new NotFoundException(`Instancia de Club de Conquistadores con ID ${club_pathf_id} no encontrada`);
            } else if (club_mg_id) {
                const clubInstance = await this.prisma.club_master_guild.findUnique({ where: { club_mg_id } });
                if (!clubInstance) throw new NotFoundException(`Instancia de Club de Guías Mayores con ID ${club_mg_id} no encontrada`);
            }
            
            const whereClauseForExisting: Prisma.club_role_assignmentsWhereInput = {
                user_id,
                role_id,
                ecclesiastical_year_id,
                active: true,
            };
            if (club_adv_id) whereClauseForExisting.club_adv_id = club_adv_id;
            else if (club_pathf_id) whereClauseForExisting.club_pathf_id = club_pathf_id;
            else if (club_mg_id) whereClauseForExisting.club_mg_id = club_mg_id;

            const existingAssignment = await this.prisma.club_role_assignments.findFirst({
                where: whereClauseForExisting
            });

            if (existingAssignment) {
                throw new ConflictException('Ya existe una asignación de rol activa para este usuario, rol e instancia de club en el año eclesiástico especificado.');
            }

            const createdAssignment = await this.prisma.club_role_assignments.create({
                data: {
                    users: { connect: { user_id } },
                    roles: { connect: { role_id } },
                    ecclesiastical_year: { connect: { year_id: ecclesiastical_year_id } },
                    start_date: new Date(start_date),
                    end_date: createClubRoleAssignmentDto.end_date ? new Date(createClubRoleAssignmentDto.end_date) : null,
                    active,
                    ...(club_adv_id && { club_adventurers: { connect: { club_adv_id } } }),
                    ...(club_pathf_id && { club_pathfinders: { connect: { club_pathf_id } } }),
                    ...(club_mg_id && { club_master_guild: { connect: { club_mg_id } } }),
                },
                include: {
                    users: { select: { user_id: true, name: true, paternal_last_name: true, email: true } },
                    roles: { select: { role_id: true, role_name: true, role_category: true } },
                    ecclesiastical_year: { select: { year_id: true, start_date: true, end_date: true } },
                    club_adventurers: { select: { club_adv_id: true } },
                    club_pathfinders: { select: { club_pathf_id: true } },
                    club_master_guild: { select: { club_mg_id: true } },
                }
            });
            return createdAssignment;
        } catch (error) {
            this.logger.error(`Error creando la asignación de rol de club: ${error.message}`, error.stack);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') { 
                    throw new ConflictException('La asignación de rol ya existe (falló la restricción de unicidad).');
                }
            }
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Could not create club role assignment.');
        }
    }

    /**
     * Obtiene una lista paginada de asignaciones de roles de club.
     * Permite filtrar por diversos criterios como ID de usuario, ID de rol, ID de instancia de club, etc.
     * @param query - Parámetros de consulta para paginación y filtrado.
     * @returns Un objeto con la lista de asignaciones, el total de registros y detalles de paginación.
     * @throws {BadRequestException} Si ocurre un error al recuperar las asignaciones.
     */
    async findAll(query: FindClubRoleAssignmentsQueryDto) {
        const { page = 1, limit = 10, user_id, role_id, club_adv_id, club_pathf_id, club_mg_id, ecclesiastical_year_id, active } = query;
        const skip = (page - 1) * limit;

        const whereClause: Prisma.club_role_assignmentsWhereInput = {};
        if (user_id) whereClause.user_id = user_id;
        if (role_id) whereClause.role_id = role_id;
        if (club_adv_id) whereClause.club_adv_id = club_adv_id;
        if (club_pathf_id) whereClause.club_pathf_id = club_pathf_id;
        if (club_mg_id) whereClause.club_mg_id = club_mg_id;
        if (ecclesiastical_year_id) whereClause.ecclesiastical_year_id = ecclesiastical_year_id;
        if (active !== undefined) whereClause.active = active;

        try {
            const [assignments, total] = await this.prisma.$transaction([
                this.prisma.club_role_assignments.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    include: {
                        users: { select: { user_id: true, name: true, paternal_last_name: true, email: true } },
                        roles: { select: { role_id: true, role_name: true, role_category: true } },
                        ecclesiastical_year: { select: { year_id: true, start_date: true, end_date: true } },
                        club_adventurers: { select: { club_adv_id: true } }, 
                        club_pathfinders: { select: { club_pathf_id: true } },
                        club_master_guild: { select: { club_mg_id: true } },
                    },
                    orderBy: {
                        created_at: 'desc' 
                    }
                }),
                this.prisma.club_role_assignments.count({ where: whereClause })
            ]);

            return {
                data: assignments,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            this.logger.error(`Error buscando todas las asignaciones de roles de club: ${error.message}`, error.stack);
            throw new BadRequestException('No se pudieron recuperar las asignaciones de roles de club.');
        }
    }

    /**
     * Encuentra una asignación de rol de club específica por su ID.
     * @param assignment_id - El ID de la asignación de rol a buscar.
     * @returns La asignación de rol encontrada.
     * @throws {NotFoundException} Si la asignación de rol con el ID especificado no se encuentra.
     * @throws {BadRequestException} Si ocurre un error al recuperar la asignación.
     */
    async findOne(assignment_id: string) {
        try {
            const assignment = await this.prisma.club_role_assignments.findUnique({
                where: { assignment_id },
                include: {
                    users: { select: { user_id: true, name: true, paternal_last_name: true, email: true } },
                    roles: { select: { role_id: true, role_name: true, role_category: true } },
                    ecclesiastical_year: { select: { year_id: true, start_date: true, end_date: true } },
                    club_adventurers: { select: { club_adv_id: true } }, 
                    club_pathfinders: { select: { club_pathf_id: true } },
                    club_master_guild: { select: { club_mg_id: true } },
                }
            });
            if (!assignment) {
                throw new NotFoundException(`Asignación de rol de club con ID ${assignment_id} no encontrada`);
            }
            return assignment;
        } catch (error) {
            this.logger.error(`Error buscando la asignación de rol de club por ID ${assignment_id}: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Could not retrieve club role assignment.');
        }
    }

    /**
     * Actualiza una asignación de rol de club existente.
     * Valida que solo se proporcione una instancia de club si se intenta modificar.
     * Verifica la existencia del rol si se actualiza y que sea de categoría CLUB.
     * @param assignment_id - El ID de la asignación de rol a actualizar.
     * @param updateClubRoleAssignmentDto - Datos para actualizar la asignación de rol.
     * @returns La asignación de rol actualizada.
     * @throws {BadRequestException} Si los datos de entrada son inválidos o si el rol no es de categoría CLUB.
     * @throws {NotFoundException} Si la asignación de rol o alguna entidad relacionada no se encuentra.
     * @throws {ConflictException} Si la actualización viola una restricción de unicidad.
     */
    async update(assignment_id: string, updateClubRoleAssignmentDto: UpdateClubRoleAssignmentDto) {
        const { user_id, role_id, club_adv_id, club_pathf_id, club_mg_id, ecclesiastical_year_id, start_date, end_date, active } = updateClubRoleAssignmentDto;

        const providedClubInstanceIds = [club_adv_id, club_pathf_id, club_mg_id].filter(id => id !== undefined && id !== null);
        if (providedClubInstanceIds.length > 1) {
            throw new BadRequestException('Solo se puede proporcionar un ID de instancia de club (club_adv_id, club_pathf_id, o club_mg_id) al actualizar.');
        }
        
        try {
            const existingAssignmentRecord = await this.prisma.club_role_assignments.findUnique({ 
                where: { assignment_id },
            });
            if (!existingAssignmentRecord) {
                throw new NotFoundException(`Asignación de rol de club con ID ${assignment_id} no encontrada`);
            }

            const dataToUpdate: Prisma.club_role_assignmentsUpdateInput = {};

            if (user_id) dataToUpdate.users = { connect: { user_id } };
            if (role_id) {
                 const role = await this.prisma.roles.findUnique({ where: { role_id } });
                 if (!role) throw new NotFoundException(`Rol con ID ${role_id} no encontrado`);
                 if (role.role_category !== 'CLUB') {
                    throw new BadRequestException(`El rol con ID ${role_id} no es de categoría CLUB.`);
                 }
                 dataToUpdate.roles = { connect: { role_id } };
            }
            if (ecclesiastical_year_id) dataToUpdate.ecclesiastical_year = { connect: { year_id: ecclesiastical_year_id } };
            if (start_date) dataToUpdate.start_date = new Date(start_date);
            if (end_date !== undefined) dataToUpdate.end_date = end_date ? new Date(end_date) : null;
            if (active !== undefined) dataToUpdate.active = active;
            
            let newClubAdvId = club_adv_id;
            let newClubPathfId = club_pathf_id;
            let newClubMgId = club_mg_id;

            if (newClubAdvId === undefined && newClubPathfId === undefined && newClubMgId === undefined) {
                 // No se está intentando cambiar la instancia del club, mantener las existentes
            } else {
                // Se está intentando cambiar la instancia del club.
                // Desconectar todas las instancias anteriores y conectar la nueva.
                dataToUpdate.club_adventurers = newClubAdvId ? { connect: { club_adv_id: newClubAdvId } } : { disconnect: existingAssignmentRecord.club_adv_id !== null };
                dataToUpdate.club_pathfinders = newClubPathfId ? { connect: { club_pathf_id: newClubPathfId } } : { disconnect: existingAssignmentRecord.club_pathf_id !== null };
                dataToUpdate.club_master_guild = newClubMgId ? { connect: { club_mg_id: newClubMgId } } : { disconnect: existingAssignmentRecord.club_mg_id !== null };
            }

            if (Object.keys(dataToUpdate).length === 0 && 
                (newClubAdvId === undefined || newClubAdvId === existingAssignmentRecord.club_adv_id) &&
                (newClubPathfId === undefined || newClubPathfId === existingAssignmentRecord.club_pathf_id) &&
                (newClubMgId === undefined || newClubMgId === existingAssignmentRecord.club_mg_id)
            ) {
                 return this.findOne(assignment_id); 
            }

            const updatedAssignment = await this.prisma.club_role_assignments.update({
                where: { assignment_id },
                data: dataToUpdate,
                include: {
                    users: { select: { user_id: true, name: true, paternal_last_name: true, email: true } },
                    roles: { select: { role_id: true, role_name: true, role_category: true } },
                    ecclesiastical_year: { select: { year_id: true, start_date: true, end_date: true } },
                    club_adventurers: { select: { club_adv_id: true } }, 
                    club_pathfinders: { select: { club_pathf_id: true } },
                    club_master_guild: { select: { club_mg_id: true } },
                }
            });
            return updatedAssignment;
        } catch (error) {
            this.logger.error(`Error actualizando la asignación de rol de club ${assignment_id}: ${error.message}`, error.stack);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') { 
                    throw new ConflictException('La actualización falló debido a una violación de restricción de unicidad.');
                }
                if (error.code === 'P2025') { 
                    throw new NotFoundException(`La asignación de rol de club con ID ${assignment_id} o una entidad relacionada no fue encontrada para la actualización.`);
                }
            }
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ConflictException || error instanceof ForbiddenException) {
                throw error;
            }
            throw new BadRequestException('Could not update club role assignment.');
        }
    }

    /**
     * Elimina una asignación de rol de club por su ID.
     * @param assignment_id - El ID de la asignación de rol a eliminar.
     * @returns Un mensaje de confirmación de la eliminación.
     * @throws {NotFoundException} Si la asignación de rol con el ID especificado no se encuentra.
     * @throws {BadRequestException} Si ocurre un error durante la eliminación.
     */
    async remove(assignment_id: string) {
        try {
            const assignment = await this.prisma.club_role_assignments.findUnique({ where: { assignment_id } });
            if (!assignment) {
                throw new NotFoundException(`Asignación de rol de club con ID ${assignment_id} no encontrada`);
            }

            await this.prisma.club_role_assignments.delete({ where: { assignment_id } });
            return { message: `Club role assignment with ID ${assignment_id} deleted successfully.` };
        } catch (error) {
            this.logger.error(`Error eliminando la asignación de rol de club ${assignment_id}: ${error.message}`, error.stack);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Asignación de rol de club con ID ${assignment_id} no encontrada para eliminación.`);
            }
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Could not delete club role assignment.');
        }
    }
} 