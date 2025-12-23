import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateMasterGuideInstanceNestedDto {
  @ApiPropertyOptional({ description: 'Whether the master guide club instance is active.', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @ApiPropertyOptional({ description: 'Target number of souls for the club.', default: 1, name: 'souls_target' })
  @IsOptional()
  @IsInt()
  souls_target?: number = 1;

  @ApiPropertyOptional({ description: 'Fee for the club.', default: 1 })
  @IsOptional()
  @IsInt()
  fee?: number = 1;

  @ApiProperty({ description: 'Meeting days, can be a flexible JSON structure or array.', isArray: true, name: 'meeting_day' })
  @IsArray()
  meeting_day: any[];

  @ApiProperty({ description: 'Meeting times, can be a flexible JSON structure or array.', isArray: true, name: 'meeting_time' })
  @IsArray()
  meeting_time: any[];
  
  @ApiProperty({ description: 'Club Type ID (should point to Master Guides type).', name: 'club_type_id' })
  @IsInt()
  @IsNotEmpty()
  club_type_id: number;
}
