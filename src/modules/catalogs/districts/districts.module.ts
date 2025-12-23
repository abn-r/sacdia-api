import { Module } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DistrictsController],
  providers: [DistrictsService],
})
export class DistrictsModule {}
