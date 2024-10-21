import { Module } from '@nestjs/common';
import { HonorsService } from './honors.service';
import { HonorsController } from './honors.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [HonorsController],
  providers: [HonorsService, PrismaService],
})
export class HonorsModule {}
