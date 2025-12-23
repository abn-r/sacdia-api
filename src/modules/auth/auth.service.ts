import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { UserProfileResponseDto, RoleDto, ClubRoleAssignmentDto } from './models/profile-response.dto';
import { role_category as RoleCategoryPrisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
    this.logger.log(`Supabase inicializado con URL: ${process.env.SUPABASE_URL}`);
  }

  async signUp(
    email: string,
    password: string,
    name: string,
    p_lastname: string,
    m_lastname: string) {
    
    this.logger.log(`[SignUp] Starting registration for email: ${email}`);
    this.logger.debug(`Calling Supabase Auth: signUp. URL: ${process.env.SUPABASE_URL}/auth/v1/signup`);
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Considerar revisar error.status para excepciones más específicas si es necesario
      throw new BadRequestException('Error creating user with Supabase: ' + error.message);
    }

    if (!data.user || !data.user.id) {
      this.logger?.error('Supabase signup response missing user data or user ID.', { email });
      throw new InternalServerErrorException('Supabase signup did not return complete user information.');
    }

    this.logger.log(`[SignUp] Supabase user created successfully with ID: ${data.user.id}`);

    try {
      this.logger.log(`[SignUp] Starting local DB transaction for user: ${data.user.id}`);
      await this.prisma.$transaction(async (transactionalPrisma) => {
        this.logger.log(`[SignUp] Creating user in local DB...`);
        await this.createUser({
          user_id: data.user.id,
          email: data.user.email,
          name: name,
          p_lastname: p_lastname,
          m_lastname: m_lastname,
        }, transactionalPrisma);
        this.logger.log(`[SignUp] User created in local DB`);

        this.logger.log(`[SignUp] Assigning default role...`);
        await this.assign_role(data.user.id, transactionalPrisma);
        this.logger.log(`[SignUp] Role assigned`);

        this.logger.log(`[SignUp] Creating PR record...`);
        await this.create_pr(data.user.id, transactionalPrisma);
        this.logger.log(`[SignUp] PR record created`);
      });
      this.logger.log(`[SignUp] Local DB transaction completed successfully for user: ${data.user.id}`);

    } catch (dbError) {
      // Si alguna operación dentro de la transacción falla, Prisma hace rollback automáticamente.
      this.logger?.error(`Local database transaction failed for Supabase user ${data.user.id}. Attempting to delete Supabase user. DB Error: ${dbError.message}`, dbError.stack);

      try {
        // Intentar eliminar el usuario de Supabase como acción de compensación
        this.logger.debug(`Calling Supabase Auth Admin: deleteUser. URL: ${process.env.SUPABASE_URL}/auth/v1/admin/users/${data.user.id}`);
        const { error: deleteAdminError } = await this.supabase.auth.admin.deleteUser(data.user.id);
        if (deleteAdminError) {
            this.logger?.error(`CRITICAL: Failed to delete Supabase user ${data.user.id} after local DB transaction failure. Supabase admin delete error: ${deleteAdminError.message}`, deleteAdminError.stack);
            // Lanzar un error que indique la falla compuesta
            throw new InternalServerErrorException(`Error setting up user profile locally, AND failed to clean up Supabase user ${data.user.id}. Supabase delete error: ${deleteAdminError.message}. Original DB error: ${dbError.message}`);
        }
        this.logger?.log(`Successfully deleted Supabase user ${data.user.id} after local DB transaction failure.`);
      } catch (supabaseDeleteCatchError) {
        // Captura errores inesperados durante la llamada a deleteUser (ej. red)
        this.logger?.error(`CRITICAL: Exception during Supabase user ${data.user.id} deletion attempt after local DB transaction failure. Supabase delete exception: ${supabaseDeleteCatchError.message}`, supabaseDeleteCatchError.stack);
        throw new InternalServerErrorException(`Error setting up user profile locally, AND an exception occurred while trying to clean up Supabase user ${data.user.id}. Supabase delete exception: ${supabaseDeleteCatchError.message}. Original DB error: ${dbError.message}`);
      }

      // Lanzar el error original de la base de datos o uno más general
      throw new InternalServerErrorException('Error setting up user profile: ' + dbError.message);
    }

    const supabaseToken = data.session?.access_token;
    if (!supabaseToken) {
      throw new InternalServerErrorException('Error creating session token');
    }

    return { user_id: data.user.id, access_token: supabaseToken };
  }


  async signIn(email: string, password: string) {
    try {
      this.logger.log(`Attempting to sign in user: ${email}`);
      
      // Verificar que los datos de Supabase estén configurados
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        this.logger.error('Configuración de Supabase incompleta');
        throw new InternalServerErrorException('Error de configuración del servidor');
      }
      
      // Intentar iniciar sesión en Supabase
      this.logger.debug(`Calling Supabase Auth: signInWithPassword. URL: ${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`);
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error(`Supabase error during sign in: ${JSON.stringify(error)}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!data || !data.user || !data.session) {
        this.logger.error('Invalid or incomplete session data');
        throw new InternalServerErrorException('Error en respuesta de autenticación');
      }
      
      // OBTENER EL CONTEXTO COMPLETO DEL USUARIO
      const userContext = await this.usersService.getUserContext(data.user.id);

      return {
        access_token: data.session.access_token,
        user_context: userContext,
      };
    } catch (error) {
      this.logger.error(`Unexpected error during sign in: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during sign in');
    }
  }

  async signOut(token: string) {
    try {
      // Close session in Supabase
      this.logger.debug(`Calling Supabase Auth: signOut. URL: ${process.env.SUPABASE_URL}/auth/v1/logout`);
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw new InternalServerErrorException('Could not sign out: ' + error.message);
      }

      return { message: 'Session closed successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error closing session');
    }
  }

  async requestPasswordReset(email: string) {
    try {
      this.logger.debug(`Calling Supabase Auth: resetPasswordForEmail. URL: ${process.env.SUPABASE_URL}/auth/v1/recover`);
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
      });

      if (error) throw error;

      return { message: 'Se ha enviado un correo electrónico con instrucciones para restablecer la contraseña.' };
    } catch (error) {
      throw new InternalServerErrorException('Error al solicitar el restablecimiento de contraseña');
    }
  }

  async resetPassword(newPassword: string, token: string) {
    try {
      this.logger.debug(`Calling Supabase Auth: updateUser (for password reset). URL: ${process.env.SUPABASE_URL}/auth/v1/user`);
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { message: 'Password updated successfully' };
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException('Invalid or expired token');
      }
      throw new InternalServerErrorException('Error resetting password');
    }
  }

  // private generateToken(user: any) {
  //   const payload = { email: user.email, sub: user.id };
  //   return {
  //     user_id: user.id,
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async createUser(userData: {
    user_id: string;
    email: string;
    name: string;
    p_lastname: string;
    m_lastname: string;
  }, prismaClient?: Prisma.TransactionClient) {
    const client = prismaClient || this.prisma;
    try {
      return await client.users.create({
        data: {
          user_id: userData.user_id,
          email: userData.email,
          name: userData.name,
          paternal_last_name: userData.p_lastname,
          mother_last_name: userData.m_lastname,
          baptism: false,
          apple_connected: false,
          fb_connected: false,
          google_connected: false,
          access_app: true,
          access_panel: false,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }
      throw new InternalServerErrorException('Error to create user');
    }
  }

  async assign_role(user_id: string, prismaClient?: Prisma.TransactionClient) {
    const client = prismaClient || this.prisma;

    try {
      // Buscar el rol "user" directamente en la base de datos
      const defaultRole = await client.roles.findFirst({
        where: { role_name: 'user' },
        select: { role_id: true },
      });

      if (!defaultRole) {
        this.logger.error('Default role with role_name "user" not found in the database');
        throw new InternalServerErrorException('Server configuration error: Default role "user" not found in database');
      }

      return await client.users_roles.create({
        data: {
          user_id: user_id,
          role_id: defaultRole.role_id,
        },
      });
    } catch (error) {
      this.logger.error(`Error assigning role to user ${user_id}: ${error.message}`, error.stack);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error to assign role: ' + error.message);
    }
  }

  async create_pr(user_id: string, prismaClient?: Prisma.TransactionClient) {
    const client = prismaClient || this.prisma;
    try {
      return await client.users_pr.create({
        data: {
          user_id: user_id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error to create registration');
    }
  }

  async check_pr(user_id: string) {
    try {
      return await this.prisma.users_pr.findFirst({
        where: {
          user_id: user_id,
        },
        select: {
          complete: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error to check registration');
    }
  }

  async complete_pr(user_id: string) {
    try {
      const userPrRecord = await this.prisma.users_pr.findFirst({
        where: { user_id: user_id },
        select: { user_pr_id: true },
      });

      if (!userPrRecord) {
        throw new InternalServerErrorException('User registration not found');
      }

      const pr_id = userPrRecord.user_pr_id;

      return await this.prisma.users_pr.update({
        where: { user_pr_id: pr_id },
        data: {
          complete: true,
          date_completed: new Date(),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error to complete registration');
    }
  }

  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    this.logger.log(`Obteniendo perfil para el usuario: ${userId}`);

    // 1. Obtener la información básica del usuario desde Prisma
    const userDetails = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!userDetails) {
      this.logger.warn(`User not found: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    // 2. Obtener el contexto de roles y permisos usando UsersService
    const userContext = await this.usersService.getUserContext(userId);

    if (!userContext) {
        this.logger.error(`User context not found for ID: ${userId}`);
        throw new InternalServerErrorException('Could not get user context.');
    }
    
    // 3. Mapear la información de userContext a los DTOs esperados
    const globalRoles: RoleDto[] = (userContext.global_roles || []).map(gr => ({
      roleId: gr.role_id,
      name: gr.role_name,
      roleCategory: gr.role_category as RoleCategoryPrisma, // Use role_category from userContext
      permissions: gr.permissions || [],
    }));

    const clubRoles: ClubRoleAssignmentDto[] = (userContext.club_assignments || [])
      .filter(ca => {
        if (!ca.role) {
          this.logger.warn(`Club assignment (ID: ${ca.assignment_id || 'N/A'}) for user ${userId} is missing role data. Skipping this assignment.`);
          return false;
        }
        return true;
      })
      .map(ca => ({ // ca.role is now guaranteed to be defined
        assignmentId: ca.assignment_id, // Asegúrate que este campo exista en userContext.club_assignments
        role: {
          roleId: ca.role.role_id,
          name: ca.role.role_name,
          roleCategory: RoleCategoryPrisma.CLUB, // Asignar categoría explícitamente
          permissions: ca.role.permissions || [],
        },
        clubAdventurersId: ca.club_adv_id || null,
        clubPathfindersId: ca.club_pathf_id || null,
        clubMasterGuildId: ca.club_mg_id || null,
        startDate: ca.start_date ? new Date(ca.start_date) : undefined,
        endDate: ca.end_date ? new Date(ca.end_date) : null,
        isActive: ca.active,
      }));

    return {
      userId: userDetails.user_id,
      email: userDetails.email,
      firstName: userDetails.name,
      lastName: `${userDetails.paternal_last_name || ''} ${userDetails.mother_last_name || ''}`.trim(),
      isActive: userDetails.active, 
      globalRoles,
      clubRoles,
    };
  }
}