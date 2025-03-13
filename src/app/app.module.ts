import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
<<<<<<< HEAD
import envValidationSchema from './config/app-env';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
=======
import { appEnvValidationSchema } from './config/app-env';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PermissionModule } from '../permission/permission.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
<<<<<<< HEAD
      validationSchema: envValidationSchema(),
    }),
    PrismaModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
=======
      validationSchema: appEnvValidationSchema(),
    }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    PermissionModule,
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
>>>>>>> images
})
export class AppModule {}
