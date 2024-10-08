import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './../prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    if (!requiredPermissions && requiredRoles.length === 0) {
      return true; // No se requieren roles o permisos
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // No hay usuario autenticado
    }

    // Obtener roles del usuario
    const userRoles = await this.prisma.user_roles.findMany({
      where: { user_id: user.user_id },
      select: {
        role_id: true,
        roles: { select: { role_name: true } }
      },
    });

    const userRoleNames = userRoles.map(userRole => userRole.roles.role_name);

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRequiredRole = requiredRoles.length > 0 && requiredRoles.some(role => userRoleNames.includes(role));

    const userPermissions = await this.prisma.role_permissions.findMany({
      where: {
        role_id: {
          in: userRoles.map(ur => ur.role_id),
        },
      },
      select: {
        permissions: { select: { permission_name: true } }
      },
    });

    const userPermissionNames = userPermissions.map(up => up.permissions.permission_name);

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasRequiredPermissions = requiredPermissions.every(permission => userPermissionNames.includes(permission));

    // Devolver true solo si se cumplen ambos: roles y permisos requeridos
    return hasRequiredRole && hasRequiredPermissions;
  }
}


/**
 import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './../prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Guard PermissionsGuard');
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]) || [];

    if (!requiredPermissions && requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // get user roles
    const userRoles = await this.prisma.user_roles.findMany({
      where: { user_id: user.id },
      select: {
        role_id: true,
        roles: { select: { role_name: true } }
      },
      //include: { roles: { select: { role_name: true } } }, //para obtener todos los campos de la tabla roles cambiar la consulta por true
    });

    const userRoleNames = userRoles.map(userRole => userRole.roles.role_name);

    // verified if user has at least one of the required roles
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
      if (hasRequiredRole) return true;
    }

    const userPermissions = await this.prisma.role_permissions.findMany({
      where: {
        role_id: {
          in: userRoles.map(ur => ur.role_id),
        },
      },
      select: {
        permissions: { select: { permission_name: true } }
      }, //para obtener todos los campos de la tabla permissions cambiar la consulta por true
    });

    const userPermissionNames = userPermissions.map(up => up.permissions.permission_name);
    return requiredPermissions.every(permission => userPermissionNames.includes(permission));
  }
}
 */