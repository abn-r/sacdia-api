import { Module } from '@nestjs/common';
import { AuthService2 } from './auth2.service';
import { AuthController2 } from './auth2.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [],
  controllers: [AuthController2],
  providers: [AuthService2],
})
export class AuthModule2 {}
