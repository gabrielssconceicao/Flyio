import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { appDocsSwagger } from './app/config/app-docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appDocsSwagger(app);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
