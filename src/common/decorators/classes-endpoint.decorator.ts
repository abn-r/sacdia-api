import { applyDecorators, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Permissions } from './rbac.decorators';
import * as ROLES from '../constants/roles';
import * as PERMISSIONS from '../constants/permissions';

export function ClassesEndpoint(options: {
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

export function ReadClasses(roles = ROLES.ALL) {
  return ClassesEndpoint({
    permission: PERMISSIONS.READ_CLASSES,
    roles
  });
}

export function CreateClasses() {
  return ClassesEndpoint({
    permission: PERMISSIONS.CREATE_CLASSES,
    roles: [...ROLES.ALL_ADMIN, ...ROLES.LF_ADMIN]
  });
}

export function UpdateClasses() {
  return ClassesEndpoint({
    permission: PERMISSIONS.UPDATE_CLASSES,
    roles: [...ROLES.ALL_ADMIN, ...ROLES.LF_ADMIN, ...ROLES.CLUB_ADMIN]
  });
}

export function DeleteClasses() {
  return ClassesEndpoint({
    permission: PERMISSIONS.DELETE_CLASSES,
    roles: [ROLES.SUPER_ADMIN]
  });
} 