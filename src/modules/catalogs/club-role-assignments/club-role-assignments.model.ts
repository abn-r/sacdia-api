/**
 * Interface para lectura de datos de club_role_assignments
 */
export interface ClubRoleAssignment {
  assignment_id: string;
  user_id?: string;
  role_id?: string;
  club_adv_id?: number | null;
  club_pathf_id?: number | null;
  club_mg_id?: number | null;
  ecclesiastical_year_id?: number;
  start_date?: Date | null;
  end_date?: Date | null;
  active?: boolean;
  created_at?: Date | null;
  modified_at?: Date | null;
  users?: {
    user_id: string;
    name: string;
  };
  roles?: {
    role_id: string;
    role_name: string;
  };
} 