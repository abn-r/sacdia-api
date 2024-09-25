import { Module } from '@nestjs/common';
import { CountriesModule } from './modules/countries/countries.module';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma.module';
import { SessionService } from './session.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: process.env.JWT_SECRET,
      }),
      global: true,
      inject: [ConfigService],
    }),
    AuthModule,
    PrismaModule,
    CountriesModule],
  controllers: [],
  providers: [
    PrismaService,
    SessionService,
  ],
  exports: [PrismaService],
})

export class AppModule {}
