/**
 * Interface para lectura de datos de clubs
 */
export interface Clubs {
    club_id: number;
    name: string;
    description?: string | null;
    active?: boolean;
    local_field_id?: number;
    address?: string | null;
    district_id?: number;
    church_id?: number;
    coordinates?: any;
    created_at?: Date | null;
    modified_at?: Date | null;
    local_fields?: {
        local_field_id: number;
        name: string;
    };
    districts?: {
        district_id: number;
        name: string;
    };
    churches?: {
        church_id: number;
        name: string;
    };
} 