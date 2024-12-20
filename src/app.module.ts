import { Module } from '@nestjs/common';
import { CountriesModule } from './modules/countries/countries.module';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma.module';
import { SessionService } from './session.service';
import { AuthModule } from './modules/auth/auth.module';
import { UnionsModule } from './modules/unions/unions.module';
import { LocalFieldsModule } from './modules/local-fields/local-fields.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { ChurchesModule } from './modules/churches/churches.module';
import { UsersModule } from './modules/users/users.module';
import { FileUploadModule } from './modules/file_upload/file_upload.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ClubTypesModule } from './modules/club_types/club_types.module';
import { HonorsModule } from './modules/honors/honors.module';
import { SupabaseModule } from './supabase/supabase.module';

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
    CountriesModule,
    UnionsModule,
    LocalFieldsModule,
    DistrictsModule,
    ChurchesModule,
    UsersModule,
    FileUploadModule,
    ClubsModule,
    ClassesModule,
    ClubTypesModule,
    HonorsModule,
    SupabaseModule],
  controllers: [],
  providers: [
    PrismaService,
    SessionService,
  ],
  exports: [PrismaService],
})

export class AppModule {}
