import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando migración personalizada...');
    
    // Verificar si la tabla club_role_types existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'club_role_types'
      );
    `;
    
    // @ts-ignore
    if (!tableExists[0].exists) {
      console.log('Creando tabla club_role_types...');
      
      // Crear la tabla
      await prisma.$executeRaw`
        CREATE TABLE "public"."club_role_types" (
          "role_type_id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
          "role_id" UUID NOT NULL,
          "club_type_id" INTEGER NOT NULL,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "modified_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "club_role_types_pkey" PRIMARY KEY ("role_type_id"),
          CONSTRAINT "club_role_types_role_id_club_type_id_key" UNIQUE ("role_id", "club_type_id"),
          CONSTRAINT "club_role_types_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "club_role_types_club_type_id_fkey" FOREIGN KEY ("club_type_id") REFERENCES "public"."club_types"("ct_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        );
      `;
      
      // Crear índices
      await prisma.$executeRaw`CREATE INDEX "idx_club_role_types_role_id" ON "public"."club_role_types"("role_id");`;
      await prisma.$executeRaw`CREATE INDEX "idx_club_role_types_club_type_id" ON "public"."club_role_types"("club_type_id");`;
      
      console.log('Tabla club_role_types creada correctamente');
    } else {
      console.log('La tabla club_role_types ya existe');
    }
    
    // Verificar si la columna club_id existe en club_role_assignments
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'club_role_assignments'
        AND column_name = 'club_id'
      );
    `;
    
    // @ts-ignore
    if (!columnExists[0].exists) {
      console.log('Añadiendo la columna club_id a club_role_assignments...');
      
      // Añadir columna
      await prisma.$executeRaw`ALTER TABLE "public"."club_role_assignments" ADD COLUMN "club_id" INTEGER;`;
      
      // Actualizar club_id basándonos en las relaciones existentes
      await prisma.$executeRaw`
        UPDATE "public"."club_role_assignments" cra
        SET "club_id" = (
          SELECT cl.club_id 
          FROM "public"."clubs" cl
          WHERE 
            (cra.club_adv_id IS NOT NULL AND cl.club_adv_id = cra.club_adv_id) OR
            (cra.club_pathf_id IS NOT NULL AND cl.club_pathf_id = cra.club_pathf_id) OR
            (cra.club_mg_id IS NOT NULL AND cl.club_mg_id = cra.club_mg_id)
          LIMIT 1
        );
      `;
      
      // Verificar registros sin club_id
      const nullClubIds = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "public"."club_role_assignments"
        WHERE "club_id" IS NULL;
      `;
      
      // @ts-ignore
      if (parseInt(nullClubIds[0].count) > 0) {
        console.error('ERROR: Existen registros sin club_id válido. Realiza una actualización manual.');
        process.exit(1);
      }
      
      // Hacer NOT NULL
      await prisma.$executeRaw`ALTER TABLE "public"."club_role_assignments" ALTER COLUMN "club_id" SET NOT NULL;`;
      
      // Añadir clave foránea
      await prisma.$executeRaw`
        ALTER TABLE "public"."club_role_assignments" 
        ADD CONSTRAINT "club_role_assignments_club_id_fkey" 
        FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("club_id") ON DELETE CASCADE ON UPDATE NO ACTION;
      `;
      
      // Crear índice
      await prisma.$executeRaw`CREATE INDEX "idx_club_role_assignments_club" ON "public"."club_role_assignments"("club_id");`;
      
      // Verificar si la restricción única existe antes de recrearla
      const uniqueConstraintExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'club_role_assignment_unique'
        );
      `;
      
      // @ts-ignore
      if (uniqueConstraintExists[0].exists) {
        await prisma.$executeRaw`ALTER TABLE "public"."club_role_assignments" DROP CONSTRAINT "club_role_assignment_unique";`;
      }
      
      await prisma.$executeRaw`
        ALTER TABLE "public"."club_role_assignments" 
        ADD CONSTRAINT "club_role_assignment_unique" 
        UNIQUE ("user_id", "role_id", "club_id", "club_adv_id", "club_pathf_id", "club_mg_id", "ecclesiastical_year_id", "start_date");
      `;
      
      console.log('Columna club_id añadida y configurada correctamente');
    } else {
      console.log('La columna club_id ya existe en club_role_assignments');
    }
    
    console.log('Migración completada exitosamente');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 