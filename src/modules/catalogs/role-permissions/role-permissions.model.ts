/**
 * Interface para lectura de datos de role_permissions
 */
export interface RolePermissions {
    role_permission_id: string;
    role_id?: string;
    permission_id?: string;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
    permissions?: {
        permission_id: string;
        permission_name: string;
    };
    roles?: {
        role_id: string;
        role_name: string;
    };
} 