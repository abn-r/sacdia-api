import { Module } from '@nestjs/common';
import { ClubTypesService } from './club_types.service';
import { ClubTypesController } from './club_types.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubTypesController],
  providers: [ClubTypesService],
})
export class ClubTypesModule {}
