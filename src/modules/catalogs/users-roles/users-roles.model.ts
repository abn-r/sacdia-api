/**
 * Interface para lectura de datos de users_roles
 */
export interface UsersRoles {
    user_role_id: string;
    user_id?: string;
    role_id?: string;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
    roles?: {
        role_id: string;
        role_name: string;
    };
    users?: {
        user_id: string;
        name: string;
    };
} 