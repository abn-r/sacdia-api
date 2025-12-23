import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseGuard } from '../../common/guards/supabase.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [AuthService, SupabaseGuard],
  exports: [AuthService, SupabaseGuard],
})
export class AuthModule {}

