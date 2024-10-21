import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService, PrismaService],
})
export class ClubsModule {}
