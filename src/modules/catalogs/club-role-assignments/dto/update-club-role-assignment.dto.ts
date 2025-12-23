import { PartialType } from '@nestjs/swagger';
import { CreateClubRoleAssignmentDto } from './create-club-role-assignment.dto';
 
export class UpdateClubRoleAssignmentDto extends PartialType(CreateClubRoleAssignmentDto) {} 