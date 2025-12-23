import { Module } from '@nestjs/common';
import { UnionsService } from './unions.service';
import { UnionsController } from './unions.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UnionsController],
  providers: [UnionsService],
})
export class UnionsModule {}