import { $Enums } from "@prisma/client";

/**
 * Interface para lectura de datos de roles
 */
export interface Roles {
    role_id: string;
    role_name: string;
    role_category?: $Enums.role_category;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
} 