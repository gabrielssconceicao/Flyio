import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { swaggerConfig } from './app/config/app-swagger';
import appConfig from './app/config/app-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appConfig(app);
  swaggerConfig(app);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
