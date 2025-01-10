import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function appDocsSwagger(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Flyio API')
    .setDescription('Flyio API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api/docs', app, document);
  return app;
}
