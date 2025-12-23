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
 * Service for managing club instances (Adventurers, Pathfinders, Master Guides)
 * Extracted from ClubsService to reduce complexity
 */
@Injectable()
export class ClubInstancesService {
  private readonly logger = new Logger(ClubInstancesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Create an Adventurer club instance
   */
  async createAdventurerInstance(dto: Prisma.club_adventurersUncheckedCreateInput) {
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

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

      await this.invalidateClubCache(dto.main_club_id);

      return { status: true, message: 'Adventurer club instance created successfully', data: newInstance };
    } catch (error) {
      return this.handleInstanceError(error, 'Adventurer');
    }
  }

  /**
   * Create a Pathfinder club instance
   */
  async createPathfinderInstance(dto: Prisma.club_pathfindersUncheckedCreateInput) {
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

    const clubType = await this.prisma.club_types.findUnique({
      where: { ct_id: dto.club_type_id }
    });
    if (!clubType) {
      throw new NotFoundException(`ClubType with ID ${dto.club_type_id} not found for Pathfinders.`);
    }

    try {
      const newInstance = await this.prisma.club_pathfinders.create({
        data: dto
      });

      await this.invalidateClubCache(dto.main_club_id);

      return { status: true, message: 'Pathfinder club instance created successfully', data: newInstance };
    } catch (error) {
      return this.handleInstanceError(error, 'Pathfinder');
    }
  }

  /**
   * Create a Master Guide club instance
   */
  async createMasterGuideInstance(dto: Prisma.club_master_guildUncheckedCreateInput) {
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: dto.main_club_id },
    });
    if (!mainClub) {
      throw new NotFoundException(`Main club with ID ${dto.main_club_id} not found.`);
    }

    const clubType = await this.prisma.club_types.findUnique({
      where: { ct_id: dto.club_type_id }
    });
    if (!clubType) {
      throw new NotFoundException(`ClubType with ID ${dto.club_type_id} not found for Master Guides.`);
    }

    try {
      const newInstance = await this.prisma.club_master_guild.create({
        data: dto
      });

      await this.invalidateClubCache(dto.main_club_id);

      return { status: true, message: 'Master Guide club instance created successfully', data: newInstance };
    } catch (error) {
      return this.handleInstanceError(error, 'Master Guide');
    }
  }

  /**
   * Get club types for a main club
   */
  async getClubTypes(mainClubId: number) {
    const mainClub = await this.prisma.clubs.findUnique({
      where: { club_id: mainClubId },
    });
    if (!mainClub) {
      throw new NotFoundException(`Club with ID ${mainClubId} not found.`);
    }

    const [adventurers, pathfinders, masterGuides] = await Promise.all([
      this.prisma.club_adventurers.findMany({
        where: { main_club_id: mainClubId, active: true },
        include: { club_types: { select: { ct_id: true, name: true } } }
      }),
      this.prisma.club_pathfinders.findMany({
        where: { main_club_id: mainClubId, active: true },
        include: { club_types: { select: { ct_id: true, name: true } } }
      }),
      this.prisma.club_master_guild.findMany({
        where: { main_club_id: mainClubId, active: true },
        include: { club_types: { select: { ct_id: true, name: true } } }
      })
    ]);

    return {
      status: true,
      data: {
        adventurers,
        pathfinders,
        masterGuides
      }
    };
  }

  private async invalidateClubCache(mainClubId: number): Promise<void> {
    await this.cacheManager.del(`club_${mainClubId}`);
    await this.cacheManager.del(`clubs_list_*`);
  }

  private handleInstanceError(error: any, instanceType: string): never {
    this.logger.error(`Error creating ${instanceType} club instance`, error.stack);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException(`${instanceType} club instance already exists or conflict with unique fields.`);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      this.logger.error(`Foreign key constraint failed on create${instanceType}Instance`, error.meta);
      throw new BadRequestException(`Invalid main_club_id or club_type_id provided. Check if they exist.`);
    }
    throw new InternalServerErrorException(`Error creating ${instanceType} club instance`);
  }
}
