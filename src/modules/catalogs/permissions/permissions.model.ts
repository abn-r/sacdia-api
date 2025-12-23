import { ApiProperty } from '@nestjs/swagger';

/**
 * Class para lectura de datos de permissions (compatible con Swagger)
 */
export class Permissions {
    @ApiProperty()
    permission_id: string;

    @ApiProperty()
    permission_name: string;

    @ApiProperty({ required: false })
    description?: string | null;

    @ApiProperty({ required: false })
    created_at?: Date | null;

    @ApiProperty({ required: false })
    modified_at?: Date | null;

    @ApiProperty({ required: false })
    active?: boolean;
} 