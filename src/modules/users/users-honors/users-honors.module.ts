import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma.module'; // Ajusta ruta
import { UsersHonorsService } from './users-honors.service';
import { UsersHonorsController } from './users-honors.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersHonorsController],
  providers: [UsersHonorsService],
  exports: [UsersHonorsService], // Exportar si se usa en otros módulos
})
export class UsersHonorsModule {} 