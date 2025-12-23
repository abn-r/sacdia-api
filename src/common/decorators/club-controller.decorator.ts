import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from '../guards/supabase.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export function ClubController(path: string) {
  return applyDecorators(
    Controller(`clubs/${path}`),
    ApiTags('Clubs'),
    UseGuards(SupabaseGuard, PermissionsGuard)
  );
} 