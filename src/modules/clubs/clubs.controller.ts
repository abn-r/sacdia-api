import { Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, BadRequestException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Roles, Permissions } from '../../common/decorators/rbac.decorators';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import * as PERMISSIONS from '../../common/constants/permissions';
import { ClubsService } from './clubs.service';
import { SupabaseGuard } from '../../common/guards/supabase.guard';
import { ClubController } from '../../common/decorators/club-controller.decorator';
import { ReadClub, CreateClub, AssignClub, UpdateClub, DeleteClub } from '../../common/decorators/club-endpoint.decorator';
import { TransformResponse } from '../../common/decorators/transform-response.decorator';
import { CreateClubContainerDto } from './dtos/create-club-container.dto';
import { CreateAdventurerInstanceDto } from './dtos/create-adventurer-instance.dto';
import { CreatePathfinderInstanceDto } from './dtos/create-pathfinder-instance.dto';
import { CreateMasterGuideInstanceDto } from './dtos/create-master-guide-instance.dto';
import { AssignClubRoleDto } from './dtos/assign-club-role.dto';
import { AssignMemberToClubDto } from './dtos/assign-member-to-club.dto';

@ClubController('')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  @CreateClub('CLUBS')
  @TransformResponse()
  async create(@Body() dto: CreateClubContainerDto) {
    const createClubInput: Prisma.clubsCreateInput = {
      name: dto.name,
      description: dto.description,
      active: dto.active,
      address: dto.address,
      coordinates: dto.coordinates as Prisma.InputJsonValue,
      local_fields: { connect: { local_field_id: dto.localFieldId } },
      districts: { connect: { district_id: dto.districtId } },
      churches: { connect: { church_id: dto.churchId } },
    };
    // 1. Validar que al menos una instancia se va a crear
    if (!dto.createAdventurerInstance && !dto.createPathfinderInstance && !dto.createMasterGuideInstance) {
      throw new BadRequestException('At least one club instance (Adventurer, Pathfinder, or Master Guide) must be selected for creation.');
    }

    const mainClub = await this.clubsService.create(createClubInput);

    if (!mainClub || !mainClub.data || !mainClub.data.club_id) {
        throw new Error('Failed to create the main club or retrieve its ID.');
    }
    const mainClubId = mainClub.data.club_id;
    const createdInstancesInfo: any = {};

    if (dto.createAdventurerInstance && dto.adventurerInstanceData) {
      const adventurerDto = dto.adventurerInstanceData;
      const createAdventurerInput: Prisma.club_adventurersUncheckedCreateInput = {
        ...(adventurerDto as any),
        main_club_id: mainClubId,
      };
      try {
        const adventurerInstance = await this.clubsService.createAdventurerInstance(createAdventurerInput);
        createdInstancesInfo.adventurer = adventurerInstance;
      } catch (error) {
        console.error(`Failed to create Adventurer instance for main club ${mainClubId}:`, error);
      }
    }

    if (dto.createPathfinderInstance && dto.pathfinderInstanceData) {
      const pathfinderDto = dto.pathfinderInstanceData;
      const createPathfinderInput: Prisma.club_pathfindersUncheckedCreateInput = {
        ...(pathfinderDto as any),
        main_club_id: mainClubId,
      };
      try {
        const pathfinderInstance = await this.clubsService.createPathfinderInstance(createPathfinderInput);
        createdInstancesInfo.pathfinder = pathfinderInstance;
      } catch (error) {
        console.error(`Failed to create Pathfinder instance for main club ${mainClubId}:`, error);
      }
    }

    if (dto.createMasterGuideInstance && dto.masterGuideInstanceData) {
      const masterGuideDto = dto.masterGuideInstanceData;
      const createMasterGuideInput: Prisma.club_master_guildUncheckedCreateInput = {
        ...(masterGuideDto as any),
        main_club_id: mainClubId,
      };
      try {
        const masterGuideInstance = await this.clubsService.createMasterGuideInstance(createMasterGuideInput);
        createdInstancesInfo.masterGuide = masterGuideInstance;
      } catch (error) {
        console.error(`Failed to create Master Guide instance for main club ${mainClubId}:`, error);
      }
    }

    return {
      message: 'Club container and specified instances processed.',
      mainClub,
      createdInstances: createdInstancesInfo,
    };
  }

  @Post('many')
  @CreateClub('CLUBS')
  @TransformResponse()
  createMany(@Body() createClubsDto: Prisma.clubsCreateInput[]) {
    return this.clubsService.createMany(createClubsDto);
  }

  @Get()
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
    @Query('where') where?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<{ status: boolean, data: any[], total: number }> {
    return await this.clubsService.findAll({
      skip: +skip || 0,
      take: +take || 10,
      cursor: cursor ? { club_id: +cursor } : undefined,
      where: where ? JSON.parse(where) : undefined,
      orderBy: orderBy ? JSON.parse(orderBy) : undefined,
    });
  }

  @Get(':id')
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clubsService.findOne(+id);
  }

  @Get('by-district/:districtId')
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  findByDistrict(@Param('districtId', ParseIntPipe) districtId: number) {
    return this.clubsService.findByDistrict(+districtId);
  }

  @Get('by-local-field/:localFieldId')
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  findByLocalField(@Param('localFieldId', ParseIntPipe) localFieldId: number) {
    return this.clubsService.findByLocalField(+localFieldId);
  }

  @Get('by-church/:churchId')
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  findByChurch(@Param('churchId', ParseIntPipe) churchId: number) {
    return this.clubsService.findByChurch(+churchId);
  }

  @Get('search')
  @ReadClub('CLUBS')
  @TransformResponse({ idField: 'club_id' })
  search(@Query('term') term: string) {
    return this.clubsService.search(term);
  }

  @Patch(':id')
  @UpdateClub('CLUBS')
  @TransformResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClubDto: Prisma.clubsUpdateInput
  ) {
    return this.clubsService.update(id, updateClubDto);
  }

  @Delete(':id')
  @DeleteClub('CLUBS')
  @TransformResponse()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.softDelete(id);
  }

  @Post(':mainClubId/adventurers')
  @CreateClub('CLUB_INSTANCES')
  @TransformResponse()
  createAdventurerInstance(
    @Param('mainClubId', ParseIntPipe) mainClubId: number,
    @Body() dto: CreateAdventurerInstanceDto,
  ) {
    const createInput: Prisma.club_adventurersUncheckedCreateInput = {
      ...dto,
      main_club_id: mainClubId,
      club_type_id: dto.clubTypeId,
    };
    return this.clubsService.createAdventurerInstance(createInput);
  }

  @Post(':mainClubId/pathfinders')
  @CreateClub('CLUB_INSTANCES')
  @TransformResponse()
  createPathfinderInstance(
    @Param('mainClubId', ParseIntPipe) mainClubId: number,
    @Body() dto: CreatePathfinderInstanceDto,
  ) {
    const createInput: Prisma.club_pathfindersUncheckedCreateInput = {
      ...dto,
      main_club_id: mainClubId,
      club_type_id: dto.clubTypeId,
    };
    return this.clubsService.createPathfinderInstance(createInput);
  }

  @Post(':mainClubId/master-guides')
  @CreateClub('CLUB_INSTANCES')
  @TransformResponse()
  createMasterGuideInstance(
    @Param('mainClubId', ParseIntPipe) mainClubId: number,
    @Body() dto: CreateMasterGuideInstanceDto,
  ) {
    const createInput: Prisma.club_master_guildUncheckedCreateInput = {
      ...dto,
      main_club_id: mainClubId,
      club_type_id: dto.clubTypeId,
    };
    return this.clubsService.createMasterGuideInstance(createInput);
  }

  @Get(':id/types')
  @ReadClub('CLUBS')
  @TransformResponse()
  getClubTypes(@Param('id', ParseIntPipe) id: number) {
    return this.clubsService.getClubTypes(id);
  }

  @Post('assign-member')
  @AssignClub('CLUB_MEMBERS')
  @TransformResponse()
  assignMemberToClub(@Body() dto: AssignMemberToClubDto) {
    // Convertir el DTO simplificado al formato que espera assignRoleToClubInstance
    const assignmentData: any = {
      user_id: dto.userId,
      ecclesiastical_year_id: dto.ecclesiasticalYearId,
      start_date: new Date(dto.startDate),
      end_date: new Date(dto.endDate),
      active: true
    };

    // Asignar el ID del club según el tipo
    switch (dto.clubType) {
      case 'adventurers':
        assignmentData.club_adv_id = dto.clubTypeId;
        break;
      case 'pathfinders':
        assignmentData.club_pathf_id = dto.clubTypeId;
        break;
      case 'master_guild':
        assignmentData.club_mg_id = dto.clubTypeId;
        break;
    }

    // Usar el servicio unificado con autoAssignMemberRole = true
    return this.clubsService.assignRoleToClubInstance(assignmentData, true);
  }

  @Post('assign-role')
  @Permissions(PERMISSIONS.ASSIGN_CLUB_ROLE)
  @UseGuards(SupabaseGuard, PermissionsGuard)
  @TransformResponse()
  assignRoleToClubInstance(@Body() dto: AssignClubRoleDto) {
    const assignInput: Prisma.club_role_assignmentsUncheckedCreateInput = {
      user_id: dto.userId,
      role_id: dto.roleId,
      club_adv_id: dto.clubAdventurerId,
      club_pathf_id: dto.clubPathfinderId,
      club_mg_id: dto.clubMasterGuideId,
      ecclesiastical_year_id: dto.ecclesiasticalYearId,
      start_date: dto.startDate,
      end_date: dto.endDate,
      active: dto.active,
    };
    return this.clubsService.assignRoleToClubInstance(assignInput);
  }
}

