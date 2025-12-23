import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseDiagnosticService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseDiagnosticService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL or SUPABASE_KEY is not set');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async runDiagnostics() {
    this.logger.log('Running Supabase diagnostics...');

    // Imprimir los primeros caracteres de las claves para verificación
    this.logger.log(`SUPABASE_URL prefix: ${this.configService.get<string>('SUPABASE_URL').substring(0, 15)}...`);
    this.logger.log(`SUPABASE_KEY prefix: ${this.configService.get<string>('SUPABASE_KEY').substring(0, 10)}...`);

    // Test connection
    const { data: connectionTest, error: connectionError } = await this.supabase.from('_test').select('*');
    this.logger.log(`Connection test: ${connectionError ? 'Failed' : 'Successful'}`);
    if (connectionError) this.logger.error('Connection error:', connectionError);

    // Test authentication
    const { data: user, error: authError } = await this.supabase.auth.getUser();
    this.logger.log(`Authentication test: ${authError ? 'Failed' : 'Successful'}`);
    if (authError) this.logger.error('Authentication error:', authError);
    else this.logger.log('Authenticated user:', user);

    // Test storage access
    const bucketName = 'avatars';
    const { data: bucketData, error: bucketError } = await this.supabase.storage.getBucket(bucketName);
    this.logger.log(`Storage bucket test: ${bucketError ? 'Failed' : 'Successful'}`);
    if (bucketError) this.logger.error('Bucket error:', bucketError);
    else this.logger.log('Bucket data:', bucketData);

    // Test file upload
    const testFileName = 'test-file.txt';
    const testFileContent = 'This is a test file';
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(bucketName)
      .upload(testFileName, testFileContent);
    this.logger.log(`File upload test: ${uploadError ? 'Failed' : 'Successful'}`);
    if (uploadError) this.logger.error('Upload error:', uploadError);
    else this.logger.log('Upload data:', uploadData);

    // Clean up test file
    if (!uploadError) {
      const { data: deleteData, error: deleteError } = await this.supabase.storage
        .from(bucketName)
        .remove([testFileName]);
      this.logger.log(`Test file cleanup: ${deleteError ? 'Failed' : 'Successful'}`);
      if (deleteError) this.logger.error('Delete error:', deleteError);
    }
  }
}