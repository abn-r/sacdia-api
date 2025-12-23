import { IsString, IsUUID, IsInt, IsOptional, IsDateString, IsBoolean, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubRoleAssignmentDto {
  @ApiProperty({ description: 'User ID (UUID)', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Role ID (UUID)', example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0' })
  @IsUUID()
  role_id: string;

  @ApiPropertyOptional({ description: 'Club Adventurers ID. Provide one of club_adv_id, club_pathf_id, or club_mg_id.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => o.club_pathf_id === undefined && o.club_mg_id === undefined)
  club_adv_id?: number;

  @ApiPropertyOptional({ description: 'Club Pathfinders ID. Provide one of club_adv_id, club_pathf_id, or club_mg_id.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => o.club_adv_id === undefined && o.club_mg_id === undefined)
  club_pathf_id?: number;

  @ApiPropertyOptional({ description: 'Club Master Guild ID. Provide one of club_adv_id, club_pathf_id, or club_mg_id.' })
  @IsOptional()
  @IsInt()
  @ValidateIf(o => o.club_adv_id === undefined && o.club_pathf_id === undefined)
  club_mg_id?: number;

  @ApiProperty({ description: 'Ecclesiastical Year ID' })
  @IsInt()
  ecclesiastical_year_id: number;

  @ApiProperty({ description: 'Start date of the assignment', example: '2024-01-01' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ description: 'End date of the assignment', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Is the assignment active?', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
} 