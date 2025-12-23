export class User {
  user_id: string;
  name: string;
  email: string;
  password: string;
  birth_date?: Date;
  gender?: string;
  phone?: string;
  address?: string;
  photo_url?: string;
  active: boolean;
  created_at: Date;
  modified_at?: Date;
  last_login?: Date;

  // Relaciones
//   user_roles: UserRole[];
//   user_permissions: UserPermission[];
//   user_allergies: UserAllergy[];
//   user_diseases: UserDisease[];
//   user_honors: UserHonor[];
//   users_classes: UserClass[];
//   users_clubs: UserClub[];
}