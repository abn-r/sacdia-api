import { applyDecorators, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Permissions } from './rbac.decorators';
import * as ROLES from '../constants/roles';
import * as PERMISSIONS from '../constants/permissions';

export function UsersEndpoint(options: {
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

export function ReadDataUser(catalog: string, roles = ROLES.ALL) {
  return UsersEndpoint({
    permission: PERMISSIONS[`READ_${catalog.toUpperCase()}`],
    roles
  });
}

export function CreateDataUser(catalog: string) {
  return UsersEndpoint({
    permission: PERMISSIONS[`CREATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER]
  });
}

export function UpdateDataUser(catalog: string) {
  return UsersEndpoint({
    permission: PERMISSIONS[`UPDATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER]
  });
}

export function DeleteDataUser(catalog: string) {
  return UsersEndpoint({
    permission: PERMISSIONS[`DELETE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER]
  });
} 