/**
 * Interface para lectura de datos de unions
 * Separada de Prisma.unionsCreateInput para evitar conflictos de tipos
 */
export interface Unions {
    union_id: number;
    name: string;
    abbreviation: string;
    active?: boolean;
    country_id?: number;
    created_at?: Date | null;
    modified_at?: Date | null;
    countries?: {
        country_id: number;
        name: string;
    };
} 