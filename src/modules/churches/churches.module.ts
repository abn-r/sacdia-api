import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';

@Module({
  controllers: [ChurchesController],
  providers: [ChurchesService],
})
export class ChurchesModule {}
