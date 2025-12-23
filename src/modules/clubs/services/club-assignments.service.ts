import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Service for managing club role assignments and member assignments
 * Extracted from ClubsService to reduce complexity
 */
@Injectable()
export class ClubAssignmentsService {
  private readonly logger = new Logger(ClubAssignmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Assign a role to a user in a club instance
   */
  async assignRoleToClubInstance(
    dto: Prisma.club_role_assignmentsUncheckedCreateInput,
    autoAssignMemberRole: boolean = false
  ) {
    // 1. Validate that only one club instance FK is present
    const instanceIds = [dto.club_adv_id, dto.club_pathf_id, dto.club_mg_id];
    const providedInstanceIds = instanceIds.filter(id => id != null);

    if (providedInstanceIds.length === 0) {
      throw new BadRequestException('One club instance ID (club_adv_id, club_pathf_id, or club_mg_id) must be provided.');
    }
    if (providedInstanceIds.length > 1) {
      throw new BadRequestException('Only one club instance ID can be provided for a role assignment.');
    }

    let role;
    
    // 2. If autoAssignMemberRole is true, find member role automatically
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
      
      dto.role_id = role.role_id;
    } else {
      // 2. Validate that role_id corresponds to a CLUB category role
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

    // 3. Validate user exists
    const user = await this.prisma.users.findUnique({ where: { user_id: dto.user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.user_id} not found.`);
    }

    // 4. Validate specific club instance exists
    await this.validateClubInstance(dto);
    
    // 5. Validate ecclesiastical_year_id exists
    const year = await this.prisma.ecclesiastical_year.findUnique({ where: { year_id: dto.ecclesiastical_year_id }});
    if (!year) {
      throw new NotFoundException(`Ecclesiastical year with ID ${dto.ecclesiastical_year_id} not found.`);
    }

    try {
      const newAssignment = await this.prisma.club_role_assignments.create({
        data: {
          user_id: dto.user_id,
          role_id: dto.role_id,
          club_adv_id: dto.club_adv_id,
          club_pathf_id: dto.club_pathf_id,
          club_mg_id: dto.club_mg_id,
          ecclesiastical_year_id: dto.ecclesiastical_year_id,
          start_date: new Date(dto.start_date),
          end_date: dto.end_date ? new Date(dto.end_date) : null,
          active: dto.active === undefined ? true : dto.active,
        },
      });

      // Invalidate relevant caches
      await this.cacheManager.del(`user-context-${dto.user_id}`);

      return { status: true, message: 'Role assigned to club instance successfully', data: newAssignment };
    } catch (error) {
      this.logger.error('Error assigning role to club instance', error.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This role assignment already exists for the user in this club instance and period.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        this.logger.error('Foreign key constraint failed on assignRoleToClubInstance', error.meta);
        throw new BadRequestException(`Invalid user_id, role_id, club instance ID, or ecclesiastical_year_id provided.`);
      }
      throw new InternalServerErrorException('Error assigning role to club instance');
    }
  }

  private async validateClubInstance(dto: Prisma.club_role_assignmentsUncheckedCreateInput): Promise<void> {
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
  }
}
