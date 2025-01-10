import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { appEnvValidationSchema } from './config/app-env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: appEnvValidationSchema(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
