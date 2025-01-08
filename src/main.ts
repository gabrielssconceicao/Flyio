import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { swaggerConfig } from './app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  swaggerConfig(app);
  await app.listen(3000);
}
bootstrap();
