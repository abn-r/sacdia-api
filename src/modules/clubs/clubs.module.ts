import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { PrismaModule } from '../../prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ClubInstancesService } from './services/club-instances.service';
import { ClubAssignmentsService } from './services/club-assignments.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClubsController],
  providers: [
    ClubsService,
    ClubInstancesService,
    ClubAssignmentsService
  ],
  exports: [
    ClubsService,
    ClubInstancesService,
    ClubAssignmentsService
  ]
})
export class ClubsModule {}
