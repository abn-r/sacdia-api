import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsDateString, ValidateIf, IsUUID, IsBoolean } from 'class-validator';

export class AssignClubRoleDto {
  @ApiProperty({ description: 'User ID to assign the role to.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Role ID to assign. Must be a CLUB category role.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({ description: 'ID of the Adventurer Club instance. Required if other instance IDs are not provided.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => !o.clubPathfinderId && !o.clubMasterGuideId)
  @IsNotEmpty({ message: 'One of clubAdventurerId, clubPathfinderId, or clubMasterGuideId must be provided.' })
  clubAdventurerId?: number;

  @ApiPropertyOptional({ description: 'ID of the Pathfinder Club instance. Required if other instance IDs are not provided.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => !o.clubAdventurerId && !o.clubMasterGuideId)
  @IsNotEmpty({ message: 'One of clubAdventurerId, clubPathfinderId, or clubMasterGuideId must be provided.' })
  clubPathfinderId?: number;

  @ApiPropertyOptional({ description: 'ID of the Master Guide Club instance. Required if other instance IDs are not provided.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => !o.clubAdventurerId && !o.clubPathfinderId)
  @IsNotEmpty({ message: 'One of clubAdventurerId, clubPathfinderId, or clubMasterGuideId must be provided.' })
  clubMasterGuideId?: number;

  @ApiProperty({ description: 'ID of the ecclesiastical year for this assignment.' })
  @IsInt()
  @IsNotEmpty()
  ecclesiasticalYearId: number;

  @ApiProperty({ description: 'Start date of the role assignment.', type: 'string', format: 'date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string; // En el servicio se convertirá a Date

  @ApiPropertyOptional({ description: 'End date of the role assignment (optional).', type: 'string', format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string; // En el servicio se convertirá a Date

  @ApiPropertyOptional({ description: 'Is the assignment active?', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
} 