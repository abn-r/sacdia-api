import { Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ClubController } from '../../../common/decorators/club-controller.decorator';
import { CreateClub, ReadClub, UpdateClub, DeleteClub } from '../../../common/decorators/club-endpoint.decorator';
import { ClubRoleAssignmentsService } from './club-role-assignments.service';
import { CreateClubRoleAssignmentDto } from './dto/create-club-role-assignment.dto';
import { UpdateClubRoleAssignmentDto } from './dto/update-club-role-assignment.dto';
import { FindClubRoleAssignmentsQueryDto } from './dto/find-club-role-assignments-query.dto';
import { TransformResponse } from '../../../common/decorators/transform-response.decorator';
@ApiBearerAuth()
@ClubController('club-role-assignments')
export class ClubRoleAssignmentsController {
    constructor(private readonly clubRoleAssignmentsService: ClubRoleAssignmentsService) {}

    @Post()
    @CreateClub('CLUB_ROLE_ASSIGNMENT')
    @TransformResponse()
    create(@Body() createClubRoleAssignmentDto: CreateClubRoleAssignmentDto) {
        return this.clubRoleAssignmentsService.create(createClubRoleAssignmentDto);
    }

    @Get()
    @ReadClub('CLUB_ROLE_ASSIGNMENTS')
    @TransformResponse()
    findAll(@Query() query: FindClubRoleAssignmentsQueryDto) {
        return this.clubRoleAssignmentsService.findAll(query);
    }

    @Get(':assignment_id')
    @ReadClub('CLUB_ROLE_ASSIGNMENT')
    @TransformResponse()
    findOne(@Param('assignment_id', ParseUUIDPipe) assignment_id: string) {
        return this.clubRoleAssignmentsService.findOne(assignment_id);
    }

    @Patch(':assignment_id')
    @UpdateClub('CLUB_ROLE_ASSIGNMENT')
    @TransformResponse()
    update(
        @Param('assignment_id', ParseUUIDPipe) assignment_id: string,
        @Body() updateClubRoleAssignmentDto: UpdateClubRoleAssignmentDto,
    ) {
        return this.clubRoleAssignmentsService.update(assignment_id, updateClubRoleAssignmentDto);
    }

    @Delete(':assignment_id')
    @DeleteClub('CLUB_ROLE_ASSIGNMENT')
    @TransformResponse()
    remove(@Param('assignment_id', ParseUUIDPipe) assignment_id: string) {
        return this.clubRoleAssignmentsService.remove(assignment_id);
    }
} 