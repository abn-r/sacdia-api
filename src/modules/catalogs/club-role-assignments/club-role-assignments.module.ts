import { Module } from '@nestjs/common';
import { ClubRoleAssignmentsService } from './club-role-assignments.service';
import { ClubRoleAssignmentsController } from './club-role-assignments.controller';
import { PrismaModule } from '../../../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubRoleAssignmentsController],
  providers: [ClubRoleAssignmentsService],
  exports: [ClubRoleAssignmentsService]
})
export class ClubRoleAssignmentsModule {} 