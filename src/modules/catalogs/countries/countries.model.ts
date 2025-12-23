/**
 * Interface para lectura de datos de countries
 */
export interface Countries {
    country_id: number;
    name: string;
    abbreviation: string;
    active?: boolean;
    created_at?: Date | null;
    modified_at?: Date | null;
}