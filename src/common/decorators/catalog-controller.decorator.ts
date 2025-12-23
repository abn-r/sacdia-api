import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SupabaseGuard } from '../guards/supabase.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

export function CatalogController(path: string) {
  return applyDecorators(
    Controller(`c/${path}`),
    ApiTags('Catalogs'),
    UseGuards(SupabaseGuard, PermissionsGuard)
  );
} 