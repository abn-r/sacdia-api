/**
 * Interface para lectura de datos de users_allergies
 */
export interface UsersAllergies {
    user_allergies_id: number;
    user_id?: string;
    allergy_id?: number;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
    allergies?: {
        allergy_id: number;
        name: string;
    };
    users?: {
        user_id: string;
        name: string;
    };
} 