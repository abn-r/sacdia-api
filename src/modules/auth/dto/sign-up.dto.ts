import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'User paternal last name',
    example: 'Doe'
  })
  @IsString()
  p_lastname: string;

  @ApiProperty({
    description: 'User maternal last name',
    example: 'Smith',
    required: false
  })
  @IsOptional()
  @IsString()
  m_lastname?: string;
}
