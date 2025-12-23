import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty, IsOptional, IsBoolean, ValidateNested, IsObject, ValidateIf, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { CreateAdventurerInstanceNestedDto } from './create-adventurer-instance-nested.dto';
import { CreatePathfinderInstanceNestedDto } from './create-pathfinder-instance-nested.dto';
import { CreateMasterGuideInstanceNestedDto } from './create-master-guide-instance-nested.dto';

// Para representar la estructura esperada de coordenadas si es un objeto JSON
class CoordinatesDto {
  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsString() // o IsNumber si esperas números directamente
  lat?: string | number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsString() // o IsNumber
  lng?: string | number; 
}

export class CreateClubContainerDto {
  @ApiProperty({ description: 'Name of the club container.', example: "Orión Main" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the club container.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the club container is active.', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @ApiPropertyOptional({ description: 'Address of the club.' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Geographic coordinates (JSON object).', type: CoordinatesDto })
  @IsOptional()
  @IsObject() // Valida que sea un objeto
  @ValidateNested() // Valida las propiedades de CoordinatesDto si se proporciona
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto | Prisma.InputJsonValue; // Prisma.InputJsonValue para flexibilidad

  @ApiProperty({ description: 'ID of the local field the club belongs to.' })
  @IsInt()
  @IsNotEmpty()
  localFieldId: number;

  @ApiProperty({ description: 'ID of the district the club belongs to.', required: true })
  @IsInt()
  @IsNotEmpty()
  districtId: number;

  @ApiProperty({ description: 'ID of the church the club is associated with.', required: true })
  @IsInt()
  @IsNotEmpty()
  churchId: number;

  // --- Nuevas propiedades para instancias de clubes ---

  @ApiPropertyOptional({ description: 'Indicates if an Adventurer club instance should be created.' })
  @IsOptional()
  @IsBoolean()
  createAdventurerInstance?: boolean;

  @ApiPropertyOptional({ description: 'Data for creating the Adventurer club instance. Required if createAdventurerInstance is true.', type: () => CreateAdventurerInstanceNestedDto })
  @ValidateIf(o => o.createAdventurerInstance === true)
  @IsDefined({ message: 'Adventurer instance data is required when createAdventurerInstance is true.'})
  @ValidateNested()
  @Type(() => CreateAdventurerInstanceNestedDto)
  adventurerInstanceData?: CreateAdventurerInstanceNestedDto;

  @ApiPropertyOptional({ description: 'Indicates if a Pathfinder club instance should be created.' })
  @IsOptional()
  @IsBoolean()
  createPathfinderInstance?: boolean;

  @ApiPropertyOptional({ description: 'Data for creating the Pathfinder club instance. Required if createPathfinderInstance is true.', type: () => CreatePathfinderInstanceNestedDto })
  @ValidateIf(o => o.createPathfinderInstance === true)
  @IsDefined({ message: 'Pathfinder instance data is required when createPathfinderInstance is true.'})
  @ValidateNested()
  @Type(() => CreatePathfinderInstanceNestedDto)
  pathfinderInstanceData?: CreatePathfinderInstanceNestedDto;

  @ApiPropertyOptional({ description: 'Indicates if a Master Guide club instance should be created.' })
  @IsOptional()
  @IsBoolean()
  createMasterGuideInstance?: boolean;

  @ApiPropertyOptional({ description: 'Data for creating the Master Guide club instance. Required if createMasterGuideInstance is true.', type: () => CreateMasterGuideInstanceNestedDto })
  @ValidateIf(o => o.createMasterGuideInstance === true)
  @IsDefined({ message: 'Master Guide instance data is required when createMasterGuideInstance is true.'})
  @ValidateNested()
  @Type(() => CreateMasterGuideInstanceNestedDto)
  masterGuideInstanceData?: CreateMasterGuideInstanceNestedDto;
} 