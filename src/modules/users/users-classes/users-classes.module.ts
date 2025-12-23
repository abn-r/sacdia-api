import { Module } from '@nestjs/common';
import { UsersClassesController } from './users-classes.controller';
import { UsersClassesService } from './users-classes.service';
import { PrismaModule } from '../../../prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [UsersClassesController],
    providers: [UsersClassesService],
})
export class UsersClassesModule {} 