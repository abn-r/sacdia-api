import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ErrorHandlerInterceptor } from './common/interceptors/error-handler.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }
  ));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ErrorHandlerInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Sacdia API')
    .setDescription('API para el sistema SACDIA - Sistema de Administración de Clubes de la IASD')
    .setVersion('1.0')
    .addTag('Authentication', 'Autenticación y autorización')
    .addTag('Users', 'Gestión de usuarios y datos personales')
    .addTag('Clubs', 'Gestión de clubes (Aventureros, Conquistadores, Guías Mayores)')
    .addTag('Classes', 'Clases y niveles de los clubes')
    .addTag('Catalogs', 'Catálogos del sistema (países, uniones, campos, etc.)')
    .addTag('Permissions Catalog', 'Gestión de permisos y roles')
    .addTag('File Upload', 'Carga de archivos')
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
