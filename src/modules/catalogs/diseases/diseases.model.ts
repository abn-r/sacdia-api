/**
 * Interface para lectura de datos de diseases
 */
export interface Diseases {
    disease_id: number;
    name: string;
    description?: string | null;
    created_at?: Date | null;
    modified_at?: Date | null;
    active?: boolean;
} 