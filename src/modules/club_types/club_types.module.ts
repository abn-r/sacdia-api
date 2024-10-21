import { Module } from '@nestjs/common';
import { ClubTypesService } from './club_types.service';
import { ClubTypesController } from './club_types.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ClubTypesController],
  providers: [ClubTypesService, PrismaService],
})
export class ClubTypesModule {}
