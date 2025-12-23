import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClubTypeDto {
  @ApiProperty({ description: 'ID del tipo de club específico', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tipo de club', example: 'adventurers', enum: ['adventurers', 'pathfinders', 'master_guild'] })
  type: string;

  @ApiProperty({ description: 'Nombre del tipo de club', example: 'Aventureros' })
  type_name: string;

  @ApiProperty({ description: 'Estado activo del club', example: true })
  active: boolean;

  @ApiProperty({ description: 'Meta de almas del club', example: 10 })
  souls_target: number;

  @ApiProperty({ description: 'Cuota del club', example: 50 })
  fee: number;

  @ApiProperty({ description: 'Días de reunión', example: [{ day: 'Saturday', time: '09:00' }] })
  meeting_day: any[];

  @ApiProperty({ description: 'Horarios de reunión', example: [{ start: '09:00', end: '11:00' }] })
  meeting_time: any[];
}

export class MainClubDto {
  @ApiProperty({ description: 'ID del club principal', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del club principal', example: 'Orión' })
  name: string;
}

export class ClubTypesDataDto {
  @ApiProperty({ description: 'Información del club principal', type: MainClubDto })
  main_club: MainClubDto;

  @ApiProperty({ description: 'Lista de tipos de clubes asociados', type: [ClubTypeDto] })
  club_types: ClubTypeDto[];
}

export class ClubTypesResponseDto {
  @ApiProperty({ description: 'Estado de la respuesta', example: true })
  status: boolean;

  @ApiProperty({ description: 'Datos de los tipos de clubes', type: ClubTypesDataDto })
  data: ClubTypesDataDto;
}
