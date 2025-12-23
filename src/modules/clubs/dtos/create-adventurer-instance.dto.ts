import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Suponiendo que meeting_day y meeting_time pueden ser estructuras JSON o arrays simples
// Si tienen una estructura más compleja, se necesitarían DTOs específicos para ellos.
class MeetingDetailDto {
  // Define aquí la estructura esperada para los detalles de reunión si es necesario
  // Por ejemplo:
  // @ApiProperty()
  // @IsString()
  // dayOfWeek: string;

  // @ApiProperty()
  // @IsString()
  // time: string;
}


export class CreateAdventurerInstanceDto {
  @ApiProperty({ description: 'ID of the main club (container) this instance belongs to.' })
  @IsInt()
  @IsNotEmpty()
  mainClubId: number;

  @ApiPropertyOptional({ description: 'Whether the adventurer club instance is active.', default: true })
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
  // @ValidateNested({ each: true }) // Descomentar si MeetingDetailDto se usa y necesita validación
  // @Type(() => MeetingDetailDto)    // Descomentar si MeetingDetailDto se usa
  meetingDay: any[]; // Prisma espera Json[], así que 'any[]' es un buen tipo base en el DTO

  @ApiProperty({ description: 'Meeting times, can be a flexible JSON structure or array.', isArray: true })
  @IsArray()
  // @ValidateNested({ each: true }) // Descomentar si MeetingDetailDto se usa y necesita validación
  // @Type(() => MeetingDetailDto)    // Descomentar si MeetingDetailDto se usa
  meetingTime: any[]; // Prisma espera Json[], así que 'any[]' es un buen tipo base en el DTO
  
  @ApiProperty({ description: 'Club Type ID (should point to Adventurers type). Hardcoded in service or validated.'})
  @IsInt()
  @IsNotEmpty()
  clubTypeId: number; // Este ID debe corresponder al tipo "Aventureros"
} 