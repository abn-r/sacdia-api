import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from '../guards/supabase.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export function ClassesController(path: string) {
  return applyDecorators(
    Controller(path),
    ApiTags('Classes'),
    UseGuards(SupabaseGuard, PermissionsGuard)
  );
} 