import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from '../guards/supabase.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export function UsersController(path: string) {
  return applyDecorators(
    Controller(`u/${path}`),
    ApiTags('Users'),
    UseGuards(SupabaseGuard, PermissionsGuard)
  );
} 