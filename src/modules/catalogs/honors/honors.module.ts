import { Module } from '@nestjs/common';
import { HonorsService } from './honors.service';
import { HonorsController } from './honors.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HonorsController],
  providers: [HonorsService],
})
export class HonorsModule {} 