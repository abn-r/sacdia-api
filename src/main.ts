import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const configService = app.get(ConfigService);
  //const port = configService.getOrThrow('PORT');

  app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true
    }
  ));

  // swagger setup
  const config = new DocumentBuilder()
    .setTitle('Sacdia API')
    .setDescription('This API helps!')
    .setVersion('1.0')
    .addTag('iasd')
    .addBearerAuth(
      { in: 'header', type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
