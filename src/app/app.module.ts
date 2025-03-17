import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
      validationSchema: appEnvValidationSchema(),
    }),
    PrismaModule,
    AuthModule,
    CloudinaryModule,
    PermissionModule,
    UserModule,
    PostModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
