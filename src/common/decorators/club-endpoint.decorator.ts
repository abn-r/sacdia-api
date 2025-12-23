import { applyDecorators, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Permissions } from './rbac.decorators';
import * as ROLES from '../constants/roles';
import * as PERMISSIONS from '../constants/permissions';

export function ClubEndpoint(options: {
  permission: string;
  roles?: string[];
  status?: HttpStatus;
}) {
  const { permission, roles = ROLES.ALL, status = HttpStatus.OK } = options;
  
  return applyDecorators(
    Roles(...roles),
    Permissions(permission),
    HttpCode(status)
  );
}

export function ReadClub(catalog: string, roles = ROLES.ALL) {
  return ClubEndpoint({
    permission: PERMISSIONS[`READ_${catalog.toUpperCase()}`],
    roles
  });
}

export function CreateClub(catalog: string) {
  return ClubEndpoint({
    permission: PERMISSIONS[`CREATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  });
}

export function AssignClub(catalog: string) {
  return ClubEndpoint({
    permission: PERMISSIONS[`CREATE_${catalog.toUpperCase()}`],
    roles: [ROLES.USER, ROLES.DIRECTOR, ROLES.DEPUTY_DIRECTOR,]
  });
}

export function UpdateClub(catalog: string) {
  return ClubEndpoint({
    permission: PERMISSIONS[`UPDATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  });
}

export function DeleteClub(catalog: string) {
  return ClubEndpoint({
    permission: PERMISSIONS[`DELETE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN]
  });
} 