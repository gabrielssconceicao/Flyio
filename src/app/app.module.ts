import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appEnvValidationSchema } from './config/app-env';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PermissionModule } from '../permission/permission.module';
import { PostModule } from '../post/post.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: appEnvValidationSchema(),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // time to live em ms
        limit: 10, // máximum number of requests
        blockDuration: 10000, // block time (ms)
      },
    ]),
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
