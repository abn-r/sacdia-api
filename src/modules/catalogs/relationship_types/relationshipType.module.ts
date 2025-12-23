import { Module } from '@nestjs/common';
import { RelationshipTypeService } from './relationshipType.service';
import { RelationshipTypeController } from './relationshipType.controller';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RelationshipTypeController],
  providers: [RelationshipTypeService],
})
export class RelationshipTypeModule {}
