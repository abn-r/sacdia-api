/**
 * Interface para lectura de datos de emergency_contacts
 */
export interface EmergencyContact {
    emergency_id: number;
    name: string;
    relationship_type?: number;
    primary?: boolean;
    created_at?: Date | null;
    modified_at?: Date | null;
    owner_id?: string;
    contact_user_id?: string | null;
    active?: boolean;
    phone: string;
    owner?: {
        user_id: string;
        name: string;
    };
    contact_user?: {
        user_id: string;
        name: string;
    } | null;
    relationship_type_rel?: {
        relationship_type_id: number;
        name: string;
    };
} 