import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
<<<<<<< HEAD
import { swaggerConfig } from './app/config/app-swagger';
import appConfig from './app/config/app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appConfig(app);
  swaggerConfig(app);
=======
import { appDocsSwagger } from './app/config/app-docs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  appDocsSwagger(app);
>>>>>>> images
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
