import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles, Permissions } from './rbac.decorators';
import * as ROLES from '../constants/roles';
import * as PERMISSIONS from '../constants/permissions';

export type ResourceAction = 'read' | 'create' | 'update' | 'delete' | 'assign';

export interface ResourceEndpointOptions {
  roles?: string[];
  status?: HttpStatus;
}

/**
 * Unified endpoint decorator that combines roles, permissions, and HTTP status
 * Replaces CatalogEndpoint, ClubEndpoint, UsersEndpoint, ClassesEndpoint
 */
export function ResourceEndpoint(
  resource: string,
  action: ResourceAction,
  options?: ResourceEndpointOptions
) {
  const permission = PERMISSIONS[`${action.toUpperCase()}_${resource.toUpperCase()}`];
  const defaultRoles = getDefaultRolesForAction(action);

  return applyDecorators(
    Roles(...(options?.roles || defaultRoles)),
    Permissions(permission),
    HttpCode(options?.status || HttpStatus.OK)
  );
}

/**
 * Get default roles based on action type
 */
function getDefaultRolesForAction(action: ResourceAction): string[] {
  switch (action) {
    case 'read':
      return ROLES.ALL;
    case 'create':
      return [ROLES.SUPER_ADMIN, ROLES.ADMIN];
    case 'update':
      return [ROLES.SUPER_ADMIN, ROLES.ADMIN];
    case 'delete':
      return [ROLES.SUPER_ADMIN];
    case 'assign':
      return [ROLES.USER, ROLES.DIRECTOR, ROLES.DEPUTY_DIRECTOR];
    default:
      return ROLES.ALL;
  }
}

// Convenience decorators for common operations
export const ReadResource = (resource: string, roles?: string[]) =>
  ResourceEndpoint(resource, 'read', { roles: roles || ROLES.ALL });

export const CreateResource = (resource: string, roles?: string[]) =>
  ResourceEndpoint(resource, 'create', { roles });

export const UpdateResource = (resource: string, roles?: string[]) =>
  ResourceEndpoint(resource, 'update', { roles });

export const DeleteResource = (resource: string, roles?: string[]) =>
  ResourceEndpoint(resource, 'delete', { roles });

export const AssignResource = (resource: string, roles?: string[]) =>
  ResourceEndpoint(resource, 'assign', { roles });
