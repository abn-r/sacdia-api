  import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from './common/cache/cache.module';
import { PrismaModule } from './prisma.module';
// Auth
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './common/supabase/supabase.module';
// Catalogs
import { CountriesModule } from './modules/catalogs/countries/countries.module';
import { UnionsModule } from './modules/catalogs/unions/unions.module';
import { LocalFieldsModule } from './modules/catalogs/local-fields/local-fields.module';
import { DistrictsModule } from './modules/catalogs/districts/districts.module';
import { ChurchesModule } from './modules/catalogs/churches/churches.module';
import { ClubTypesModule } from './modules/catalogs/club_types/club_types.module';
import { HonorsModule } from './modules/catalogs/honors/honors.module';
import { HonorsCategoriesModule } from './modules/catalogs/honors-categories/honors-categories.module';
import { MasterHonorsModule } from './modules/catalogs/master-honors/master-honors.module';
import { DiseasesModule } from './modules/catalogs/diseases/diseases.module';
import { AllergiesModule } from './modules/catalogs/allergies/allergies.module';
import { RelationshipTypeModule } from './modules/catalogs/relationship_types/relationshipType.module';
import { PermissionsModule } from './modules/catalogs/permissions/permissions.module';
import { RolesModule } from './modules/catalogs/roles/roles.module';
import { RolePermissionsModule } from './modules/catalogs/role-permissions/role-permissions.module';
// Users
import { UsersModule } from './modules/users/users.module';
import { FileUploadModule } from './modules/file_upload/file_upload.module';
import { UsersRolesModule } from './modules/catalogs/users-roles/users-roles.module';
import { UsersAllergiesModule } from './modules/users/users-allergies/users-allergies.module';
import { UsersDiseasesModule } from './modules/users/users-diseases/users-diseases.module';
// Clubs
import { ClubsModule } from './modules/clubs/clubs.module';
import { ClassesModule } from './modules/classes/classes.module';
import { EmergencyContactModule } from './modules/users/emergency_contact/emergency_contact.module';
import { UsersClassesModule } from './modules/users/users-classes/users-classes.module';
import { UsersHonorsModule } from './modules/users/users-honors/users-honors.module';

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
    PrismaModule,
    SupabaseModule,
    AuthModule,
    AllergiesModule,
    ChurchesModule,
    ClubTypesModule,
    CountriesModule,
    DiseasesModule,
    DistrictsModule,
    HonorsModule,
    HonorsCategoriesModule,
    MasterHonorsModule,
    LocalFieldsModule,
    UnionsModule,
    PermissionsModule,
    RolesModule,
    RolePermissionsModule,
    UsersModule,
    UsersRolesModule,
    EmergencyContactModule,
    ClassesModule,
    ClubsModule,
    FileUploadModule,
    CacheModule,
    RelationshipTypeModule,
    UsersAllergiesModule,
    UsersDiseasesModule,
    UsersClassesModule,
    UsersHonorsModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
