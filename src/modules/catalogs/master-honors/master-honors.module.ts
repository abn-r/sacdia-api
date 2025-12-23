import { Module } from '@nestjs/common';
import { MasterHonorsService } from './master-honors.service';
import { MasterHonorsController } from './master-honors.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterHonorsController],
  providers: [MasterHonorsService],
})
export class MasterHonorsModule {} 