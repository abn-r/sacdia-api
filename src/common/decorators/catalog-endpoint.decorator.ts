import { applyDecorators, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Permissions } from './rbac.decorators';
import * as ROLES from '../constants/roles';
import * as PERMISSIONS from '../constants/permissions';

export function CatalogEndpoint(options: {
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

export function ReadCatalog(catalog: string, roles = ROLES.ALL) {
  return CatalogEndpoint({
    permission: PERMISSIONS[`READ_${catalog.toUpperCase()}`],
    roles
  });
}

export function CreateCatalog(catalog: string) {
  return CatalogEndpoint({
    permission: PERMISSIONS[`CREATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  });
}

export function UpdateCatalog(catalog: string) {
  return CatalogEndpoint({
    permission: PERMISSIONS[`UPDATE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  });
}

export function DeleteCatalog(catalog: string) {
  return CatalogEndpoint({
    permission: PERMISSIONS[`DELETE_${catalog.toUpperCase()}`],
    roles: [ROLES.SUPER_ADMIN]
  });
} 