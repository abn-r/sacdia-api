import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './supabase.guard';

const DUPLICATE_REQUEST_WINDOW_MS = 1000; // Ventana de tiempo en ms para considerar duplicado (1 segundo)

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);
  // Almacena el timestamp de la última vez que se vio una combinación de método+URL
  private processedRequests = new Map<string, number>();

  
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authenticatedUser = request.user as AuthenticatedUser;

    // Clave basada solo en método y URL
    const requestId = `${request.method}-${request.url}`;
    const currentTime = Date.now();
    
    if (this.processedRequests.has(requestId)) {
      const lastRequestTime = this.processedRequests.get(requestId);
      if (lastRequestTime && (currentTime - lastRequestTime < DUPLICATE_REQUEST_WINDOW_MS)) {
        this.logger.debug(`Duplicate request detected for ${requestId} within ${DUPLICATE_REQUEST_WINDOW_MS}ms window. Allowing.`);
        // Considerar si realmente quieres permitirlo o si esto debería ser un error o un manejo especial.
        // Por ahora, mantenemos el comportamiento original de permitirlo.
        return true; 
      }
    }
    
    // Actualiza el timestamp para esta combinación de método+URL
    this.processedRequests.set(requestId, currentTime);

    // Limpieza del mapa para evitar que crezca indefinidamente (opcional, pero buena práctica)
    // Esto se puede hacer de forma más sofisticada, pero para este ejemplo:
    setTimeout(() => {
      // Solo elimina si el timestamp no ha sido actualizado por una solicitud más reciente
      if (this.processedRequests.get(requestId) === currentTime) {
        this.processedRequests.delete(requestId);
      }
    }, DUPLICATE_REQUEST_WINDOW_MS * 2); // Mantener la entrada un poco más de la ventana de detección

    if (request.method === 'OPTIONS') {
      return true;
    }

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

    if (!authenticatedUser || !authenticatedUser.id) {
      this.logger.warn('No authenticated user found in request for permission check.');
      throw new UnauthorizedException('User not authenticated');
    }

    const userEffectivePermissions = authenticatedUser.effective_permissions || [];
    
    const userGlobalRoleNames = authenticatedUser.user_context?.global_roles?.map(r => r.role_name) || [];

    const hasRequiredRole = requiredRoles.length === 0 ||
      requiredRoles.some(role => userGlobalRoleNames.includes(role));

    const hasRequiredPermissions = !requiredPermissions ||
      requiredPermissions.every(permission =>
        userEffectivePermissions.includes(permission)
      );
    
    if (!hasRequiredRole) {
        this.logger.debug(`User ${authenticatedUser.id} denied access. Missing roles: ${requiredRoles.join(', ')}. User roles: ${userGlobalRoleNames.join(', ')}`);
    }
    if (!hasRequiredPermissions) {
        this.logger.debug(`User ${authenticatedUser.id} denied access. Missing permissions: ${requiredPermissions?.join(', ')}. User permissions: ${userEffectivePermissions.join(', ')}`);
    }

    return hasRequiredRole && hasRequiredPermissions;
  }
}