import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Guard RbacGuard');
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
      return true; // No roles or permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes the JWT guard has already attached the user

    if (!user) {
      return false; // No authenticated user
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const userRoles = await this.prisma.user_roles.findMany({
        where: { user_id: user.userId },
        include: { roles: true },
      });
      const hasRequiredRole = userRoles.some(ur => requiredRoles.includes(ur.roles.role_name));
      if (hasRequiredRole) return true;
    }

    // Check permissions based on roles
    if (requiredPermissions.length > 0) {
      const userRolePermissions = await this.prisma.user_roles.findMany({
        where: { user_id: user.userId },
        include: {
          roles: {
            include: {
              role_permissions: {
                include: { permissions: true },
              },
            },
          },
        },
      });

      const allPermissions = userRolePermissions.flatMap(urp => 
        urp.roles.role_permissions.map(rp => rp.permissions.permission_name)
      );

      const hasRequiredPermission = requiredPermissions.every(p => allPermissions.includes(p));
      if (hasRequiredPermission) return true;
    }

    return false;
  }
}

/** 
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Guard RbacGuard');
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
      return true; // No roles or permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes the JWT guard has already attached the user

    if (!user) {
      return false; // No authenticated user
    }

    // Check roles
    if (requiredRoles.length > 0) {
      const userRoles = await this.prisma.user_roles.findMany({
        where: { user_id: user.userId },
        include: { roles: true },
      });
      console.log('userRoles:', userRoles.map(ur => ur.roles.role_name));
      const hasRequiredRole = userRoles.some(ur => requiredRoles.includes(ur.roles.role_name));
      console.log('hasRequiredRole:', hasRequiredRole);
      if (hasRequiredRole) return true;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      // Check user's direct permissions
      const userPermissions = await this.prisma.user_permissions.findMany({
        where: { user_id: user.userId },
        include: { permissions: true },
      });
      console.log('userPermissions:', userPermissions.map(up => up.permissions.permission_name));
      
      // Check permissions from user's roles
      const userRolePermissions = await this.prisma.user_roles.findMany({
        where: { user_id: user.userId },
        include: {
          roles: {
            include: {
              role_permissions: {
                include: { permissions: true },
              },
            },
          },
        },
      });

      console.log('userRolePermissions:', userRolePermissions.map(urp => urp.roles.role_name));

      const allPermissions = [
        ...userPermissions.map(up => up.permissions.permission_name),
        ...userRolePermissions.flatMap(urp => 
          urp.roles.role_permissions.map(rp => rp.permissions.permission_name)
        ),
      ];

      const hasRequiredPermission = requiredPermissions.every(p => allPermissions.includes(p));
      console.log('hasRequiredPermission:', hasRequiredPermission);
      if (hasRequiredPermission) return true;
    }

    return false;
  }
}
*/