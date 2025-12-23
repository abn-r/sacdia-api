import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for specifying a permission to be created or found.
 */
export class CreatePermissionInputDto {
  @ApiProperty({ description: 'The unique name of the permission', example: 'create:users' })
  @IsString()
  @IsNotEmpty()
  permission_name: string;

  @ApiProperty({ description: 'Optional description for the permission', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * DTO for the request body to assign permissions to roles.
 */
export class AssignPermissionsToRolesDto {
  @ApiProperty({
    description: 'Array of permissions to create or assign',
    type: [CreatePermissionInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionInputDto)
  permissions: CreatePermissionInputDto[];

  @ApiProperty({
    description: 'Array of role UUIDs to assign permissions to',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  roleIds: string[];
}

// You might want a specific Response DTO later, but for now, the service can return a simple structure.
// export class AssignPermissionsToRolesResponseDto { ... } 