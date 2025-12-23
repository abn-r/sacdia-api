import { IsOptional, IsUUID, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../../common/dtos/pagination-query.dto';

export class FindClubRoleAssignmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by User ID (UUID)' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Role ID (UUID)' })
  @IsOptional()
  @IsUUID()
  role_id?: string;

  @ApiPropertyOptional({ description: 'Filter by Club Adventurers ID' })
  @IsOptional()
  @IsInt()
  club_adv_id?: number;

  @ApiPropertyOptional({ description: 'Filter by Club Pathfinders ID' })
  @IsOptional()
  @IsInt()
  club_pathf_id?: number;

  @ApiPropertyOptional({ description: 'Filter by Club Master Guild ID' })
  @IsOptional()
  @IsInt()
  club_mg_id?: number;

  @ApiPropertyOptional({ description: 'Filter by Ecclesiastical Year ID' })
  @IsOptional()
  @IsInt()
  ecclesiastical_year_id?: number;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 