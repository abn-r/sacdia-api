import {
  Injectable,
  ExecutionContext,
  CanActivate,
  Logger,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, User } from '@supabase/supabase-js';
import { UsersService } from '../../modules/users/users.service';
import { Reflector } from '@nestjs/core';

// Interfaz para el usuario autenticado, extendiendo la información básica de Supabase User
// e incluyendo el contexto local y los permisos efectivos.
export interface AuthenticatedUser extends User {
  user_context?: any;
  effective_permissions?: string[];
}


@Injectable()
// SupabaseGuard es un guard de NestJS que implementa CanActivate para proteger rutas.
// Verifica la autenticación con Supabase y carga el contexto/permisos del usuario local.
export class SupabaseGuard implements CanActivate {
  // Cliente de Supabase para interactuar con sus servicios de autenticación.
  private supabase;
  // Logger para registrar eventos e información de depuración.
  private readonly logger = new Logger(SupabaseGuard.name);

  // Constructor que inyecta los servicios necesarios y configura el cliente Supabase.
  constructor(
    private readonly usersService: UsersService, // Servicio para obtener el contexto local del usuario.
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inyecta el gestor de caché
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  // Método principal del guard que determina si una solicitud puede proceder.
  // Es asíncrono porque interactúa con servicios externos (Supabase) y la base de datos local.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtiene el objeto request de la solicitud HTTP actual.
    const request = context.switchToHttp().getRequest();
    this.logger.log(`Processing request: ${request.method} ${request.originalUrl || request.url}`);

    // Si la solicitud es de tipo OPTIONS (preflight), permitirla directamente
    // ya que no lleva credenciales y es para verificación CORS.
    if (request.method === 'OPTIONS') {
      return true;
    }

    const operationId = request.headers['x-request-id'] || 'N/A'; // Para seguimiento

    try {
      // Intenta extraer el token de autenticación del encabezado de la solicitud.
      const token = this.extractTokenFromHeader(request);
      
      // Si no hay token, registra una advertencia y lanza un error de no autorizado.
      if (!token) {
        this.logger.warn('No token found in request header.');
        throw new UnauthorizedException('No token provided');
      }
      
      const { data: { user: supabaseUser }, error: supabaseError } = await this.supabase.auth.getUser(token);
      
      // Si hay un error en Supabase o no se encuentra el usuario, registra una advertencia y lanza un error de no autorizado.
      if (supabaseError || !supabaseUser) {
        this.logger.warn(`Supabase auth error or no user: ${supabaseError?.message}`);
        throw new UnauthorizedException(supabaseError?.message || 'Invalid token or user not found');
      }
      
      const cacheKey = `user-context-${supabaseUser.id}`;
      let userContext = await this.cacheManager.get<any>(cacheKey);

      if (userContext) {
      } else {
        userContext = await this.usersService.getUserContext(supabaseUser.id);
        // Si no se encuentra el contexto local del usuario, registra una advertencia y lanza un error de no autorizado.
        if (!userContext) {
          this.logger.warn(`[${operationId}] User context not found in local DB for Supabase user ${supabaseUser.id}`);
          throw new UnauthorizedException('User details not found in application');
        }
        // Almacena el contexto del usuario en caché.
        // El TTL (Time To Live) se puede configurar globalmente en CacheModule.register o aquí específicamente.
        await this.cacheManager.set(cacheKey, userContext /*, { ttl: 300 } */);
      }

      // Calcula los permisos efectivos del usuario consolidando permisos de roles globales y asignaciones a clubes.
      const effectivePermissions = new Set<string>();
      // Añade permisos de roles globales.
      userContext.global_roles?.forEach(role => {
        role.permissions?.forEach(perm => effectivePermissions.add(perm));
      });
      
      // Añade permisos de asignaciones a clubes.
      userContext.club_assignments?.forEach(assignment => {
        assignment.permissions?.forEach(perm => {
          effectivePermissions.add(perm);
        });
      });
      
      // Adjunta la información completa del usuario (Supabase + contexto local + permisos) al objeto request.
      // Esto permite que los controladores y servicios accedan a ella fácilmente.
      request.user = {
        ...supabaseUser,
        user_context: userContext,
        effective_permissions: Array.from(effectivePermissions),
      } as AuthenticatedUser;
      return true;
    } catch (error) {
      // Captura cualquier excepción durante el proceso, la registra y relanza un error de no autorizado.
      this.logger.error(`[${operationId}] Exception in SupabaseGuard: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed due to an unexpected error');
    }
  }

  // Método privado para extraer el token Bearer del encabezado Authorization.
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
