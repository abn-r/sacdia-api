import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignMemberToClubDto {
  @ApiProperty({ 
    description: 'ID del usuario a asignar al club', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    description: 'Tipo de club al que se asignará el usuario', 
    example: 'adventurers',
    enum: ['adventurers', 'pathfinders', 'master_guild']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['adventurers', 'pathfinders', 'master_guild'])
  clubType: 'adventurers' | 'pathfinders' | 'master_guild';

  @ApiProperty({ 
    description: 'ID del tipo de club específico', 
    example: 1 
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  clubTypeId: number;

  @ApiProperty({ 
    description: 'ID del año eclesiástico', 
    example: 1 
  })
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  ecclesiasticalYearId: number;

  @ApiProperty({ 
    description: 'Fecha de inicio de la asignación', 
    example: '2024-01-01' 
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ 
    description: 'Fecha de fin de la asignación', 
    example: '2024-12-31' 
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
