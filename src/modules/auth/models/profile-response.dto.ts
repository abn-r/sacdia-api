import { role_category as RoleCategory } from '@prisma/client';

export interface RoleDto {
  roleId: string;
  name: string;
  roleCategory: RoleCategory;
  permissions: string[]; // Added permissions
}

export interface ClubRoleAssignmentDto {
  assignmentId: string;
  role: RoleDto;
  clubAdventurersId?: number | null;
  clubPathfindersId?: number | null;
  clubMasterGuildId?: number | null;
  startDate: Date;
  endDate?: Date | null;
  isActive: boolean;
}

export interface UserProfileResponseDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  globalRoles: RoleDto[];
  clubRoles: ClubRoleAssignmentDto[];
} 