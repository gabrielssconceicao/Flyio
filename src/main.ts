import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { appDocsSwagger } from './app/config/app-docs';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  if(process.env.NODE_ENV === 'production') {
    app.use(helmet())
    app.enableCors({
      origin:[ process.env.CLIENT_URL, `http://localhost:${process.env.APP_PORT ?? 3000}`],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
      allowedHeaders: 'Content-Type, Authorization'
    })
  }
  appDocsSwagger(app);
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
