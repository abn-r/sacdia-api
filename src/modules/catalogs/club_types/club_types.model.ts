/**
 * Interface para lectura de datos de club_types
 */
export interface ClubTypes {
    ct_id: number;
    name: string;
    active?: boolean;
    created_at?: Date | null;
    modified_at?: Date | null;
} 