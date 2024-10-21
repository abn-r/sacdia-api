import { Command, CommandRunner } from 'nest-commander';
import { SupabaseDiagnosticService } from './supabase-diagnostic.service';

@Command({ name: 'run-supabase-diagnostics' })
export class SupabaseDiagnosticCommand extends CommandRunner {
  constructor(private readonly diagnosticService: SupabaseDiagnosticService) {
    super();
  }

  async run(): Promise<void> {
    await this.diagnosticService.runDiagnostics();
  }
}