import { Module } from '@nestjs/common';
import { UsersAllergiesController } from './users-allergies.controller';
import { UsersAllergiesService } from './users-allergies.service';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersAllergiesController],
  providers: [UsersAllergiesService],
})
export class UsersAllergiesModule {} 