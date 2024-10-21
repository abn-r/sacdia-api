import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseDiagnosticService } from './supabase-diagnostic.service';
import { SupabaseDiagnosticCommand } from './supabase-diagnostic.command';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseDiagnosticService, SupabaseDiagnosticCommand],
  exports: [SupabaseDiagnosticService],
})
export class SupabaseModule {}