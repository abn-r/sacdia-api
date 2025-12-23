import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateMasterGuideInstanceDto {
  @ApiProperty({ description: 'ID of the main club (container) this instance belongs to.' })
  @IsInt()
  @IsNotEmpty()
  mainClubId: number;

  @ApiPropertyOptional({ description: 'Whether the master guide club instance is active.', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @ApiPropertyOptional({ description: 'Target number of souls for the club.', default: 1 })
  @IsOptional()
  @IsInt()
  soulsTarget?: number = 1;

  @ApiPropertyOptional({ description: 'Fee for the club.', default: 1 })
  @IsOptional()
  @IsInt()
  fee?: number = 1;

  @ApiProperty({ description: 'Meeting days, can be a flexible JSON structure or array.', isArray: true })
  @IsArray()
  meetingDay: any[];

  @ApiProperty({ description: 'Meeting times, can be a flexible JSON structure or array.', isArray: true })
  @IsArray()
  meetingTime: any[];
  
  @ApiProperty({ description: 'Club Type ID (should point to Master Guides type).' })
  @IsInt()
  @IsNotEmpty()
  clubTypeId: number; // Este ID debe corresponder al tipo "Guias Mayores"
} 