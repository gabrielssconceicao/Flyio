import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
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
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
