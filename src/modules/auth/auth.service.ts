import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  async signUp(email: string, password: string, name:string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new BadRequestException('Error creating user: ' + error.message);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.createUser({
        user_id: data.user.id,
        email: data.user.email,
        name: name,
      });
      await this.assing_role(data.user.id);
      await this.create_pr(data.user.id);
    } catch (dbError) {
      // if fails to create user in local database, delete user from Supabase
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw new InternalServerErrorException('Error: ' + dbError.message);
    }

    return this.generateToken(data.user);
  } catch(error: { message: string; }) {
    if (error instanceof ConflictException) {
      throw error;
    }
    if (error.message === 'User already registered') {
      throw new ConflictException('User already registered');
    }
    throw new InternalServerErrorException('Error during registration');
  }


  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return this.generateToken(data.user);
  }

  async signOut(token: string) {
    try {
      // Verifiy and decode token
      const decodedToken = this.jwtService.verify(token);

      // Close session in Supabase
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      // Aquí podrías realizar cualquier limpieza adicional necesaria en tu aplicación
      // Por ejemplo, invalidar el token en una lista negra, actualizar el estado del usuario, etc.

      // Si estás usando una lista negra de tokens, podrías agregar el token a esa lista aquí
      // await this.tokenBlacklistService.addToBlacklist(token);

      return { message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }
      throw new InternalServerErrorException('Error al cerrar la sesión');
    }
  }

  async requestPasswordReset(email: string) {
    try {
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
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error.status === 400) {
        throw new BadRequestException('Token inválido o expirado');
      }
      throw new InternalServerErrorException('Error al restablecer la contraseña');
    }
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(userData: {
    user_id: string;
    email: string;
    name: string;
  }) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const newUser = await prisma.users.create({
          data: {
            user_id: userData.user_id,
            email: userData.email,
            name: userData.name,
            gender: 1,
            baptism: false,
            apple_connected: false,
            fb_connected: false,
            google_connected: false,
            access_app: true,
            access_panel: false,
          },
        });
        return newUser;
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

  async assing_role(user_id: string) {
    try {
      return await this.prisma.user_roles.create({
        data: {
          user_id: user_id,
          role_id: process.env.DEFAULT_ROLE,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error to assign role');
    }
  }

  async create_pr(user_id: string) {
    try {
      return await this.prisma.users_pr.create({
        data: {
          user_id: user_id,
          complete: false,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error to complete registration');
    }
  }
}