import { Module } from '@nestjs/common';
import { LocalFieldsService } from './local-fields.service';
import { LocalFieldsController } from './local-fields.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [LocalFieldsController],
  providers: [LocalFieldsService, PrismaService],
})
export class LocalFieldsModule {}
