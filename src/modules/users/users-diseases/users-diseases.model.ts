/**
 * Interface para lectura de datos de users_diseases
 */
export interface UsersDiseases {
    user_disease_id: number;
    user_id?: string;
    disease_id?: number;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
    diseases?: {
        disease_id: number;
        name: string;
    };
    users?: {
        user_id: string;
        name: string;
    };
} 