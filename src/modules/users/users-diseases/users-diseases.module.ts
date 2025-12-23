import { Module } from '@nestjs/common';
import { UsersDiseasesController } from './users-diseases.controller';
import { UsersDiseasesService } from './users-diseases.service';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersDiseasesController],
  providers: [UsersDiseasesService],
})
export class UsersDiseasesModule {} 