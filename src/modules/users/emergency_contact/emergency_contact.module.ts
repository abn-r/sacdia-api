import { Module } from '@nestjs/common';
import { EmergencyContactController } from './emergency_contact.controller';
import { EmergencyContactService } from './emergency_contact.service';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EmergencyContactController],
  providers: [EmergencyContactService],
})
export class EmergencyContactModule {}
