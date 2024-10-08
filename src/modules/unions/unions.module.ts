import { Module } from '@nestjs/common';
import { UnionsService } from './unions.service';
import { UnionsController } from './unions.controller';
import { PrismaService } from "../../prisma.service";


@Module({
  controllers: [UnionsController],
  providers: [UnionsService, PrismaService],
})
export class UnionsModule {}