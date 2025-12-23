import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, IsJSON } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger'; // Asumiendo Swagger para documentación

export class CreateUserHonorDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ description: 'ID del usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  user_id: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({ description: 'ID del honor', example: 1 })
  honor_id: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Indica si la asignación está activa', default: true, required: false })
  active?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Indica si el honor está validado/completado', default: false, required: false })
  validate?: boolean = false;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Ruta o identificador del certificado', required: false, example: 'path/to/certificate.pdf' })
  certificate?: string;

  @IsOptional()
  @IsJSON()
  @ApiProperty({ 
    description: 'JSON con rutas o identificadores de imágenes', 
    required: false, 
    example: '["img1.jpg", "img2.png"]',
    type: 'string' 
  })
  images?: string; // Changed from any to string for JSON validation

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Ruta o identificador de un documento adicional', required: false, example: 'path/to/document.docx' })
  document?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Fecha de la asignación', required: true, example: '2025-01-01' })
  date?: Date;
}

export class UpdateUserHonorDto extends PartialType(CreateUserHonorDto) {
  // Add explicit property validator to prevent incorrect field names
  // This prevents 'validated' which should be 'validate'
}

export class HonorInCategoryDto {
    @ApiProperty()
    honor_id: number;
    @ApiProperty()
    honor_name: string;
    @ApiProperty()
    honor_image?: string;
    @ApiProperty()
    honor_material?: string;
    @ApiProperty()
    user_honor_id: number;
    @ApiProperty()
    validate: boolean;
    @ApiProperty()
    date: Date;
    @ApiProperty()
    certificate: string;
    @ApiProperty()
    images: string[];
    @ApiProperty()
    document: string;
}

export class GroupedUserHonorsDto {
    @ApiProperty()
    category_id: number;
    @ApiProperty()
    category_name: string;
    @ApiProperty({ type: [HonorInCategoryDto] })
    honors: HonorInCategoryDto[];
} 