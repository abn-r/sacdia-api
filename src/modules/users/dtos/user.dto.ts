import { IsString, IsEmail, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre completo del usuario' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento' })
  @IsOptional()
  @IsDate()
  birth_date?: Date;

  @ApiPropertyOptional({ description: 'Género del usuario' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Número telefónico' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Dirección del usuario' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'URL de la foto de perfil' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ description: 'Estado del usuario', default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}