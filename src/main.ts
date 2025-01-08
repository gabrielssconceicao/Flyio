import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { swaggerConfig } from './app/config/app-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  swaggerConfig(app);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
