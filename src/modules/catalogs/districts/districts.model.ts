/**
 * Interface para lectura de datos de districts
 */
export interface Districts {
    district_id: number;
    name: string;
    active?: boolean;
    local_field_id?: number;
    created_at?: Date | null;
    modified_at?: Date | null;
    local_fields?: {
        local_field_id: number;
        name: string;
    };
} 