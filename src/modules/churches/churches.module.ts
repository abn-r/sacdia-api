import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ChurchesController],
  providers: [ChurchesService, PrismaService],
})
export class ChurchesModule {}
