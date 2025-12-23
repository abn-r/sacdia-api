import { Module } from '@nestjs/common';
import { LocalFieldsService } from './local-fields.service';
import { LocalFieldsController } from './local-fields.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LocalFieldsController],
  providers: [LocalFieldsService],
})
export class LocalFieldsModule {}
