import { Module } from '@nestjs/common';
import { HonorsCategoriesService } from './honors-categories.service';
import { HonorsCategoriesController } from './honors-categories.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [HonorsCategoriesController],
  providers: [HonorsCategoriesService],
})

export class HonorsCategoriesModule {} 