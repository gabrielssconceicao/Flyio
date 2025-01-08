import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import envValidationSchema from './config/app-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: envValidationSchema(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
