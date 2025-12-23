/**
 * Script para generar archivo OpenAPI sin iniciar el servidor
 * Ejecutar: npx ts-node scripts/generate-openapi.ts
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateOpenApiSpec() {
  console.log('🔄 Generando especificación OpenAPI...\n');
  
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Sacdia API')
    .setDescription('API para el sistema SACDIA - Sistema de Administración de Clubes de la IASD')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('catalogs', 'Catálogos del sistema')
    .addTag('clubs', 'Gestión de clubes')
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Crear directorio si no existe
  const outputDir = path.join(__dirname, '../docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar como JSON (para Postman/Apidog)
  const jsonPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ OpenAPI JSON generado: ${jsonPath}`);

  await app.close();
  
  console.log('\n📥 Importar en Postman: File > Import > seleccionar openapi.json');
  console.log('📥 Importar en Apidog: Settings > Import > OpenAPI > seleccionar archivo');
}

generateOpenApiSpec().catch(console.error);
