/**
 * Interface para lectura de datos de allergies
 */
export interface Allergy {
  allergy_id: number;
  name: string;
  description?: string | null;
  active?: boolean;
  created_at?: Date | null;
  modified_at?: Date | null;
}
