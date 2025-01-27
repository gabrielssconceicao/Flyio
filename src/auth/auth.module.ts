import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
@Global()
@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),

    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    AuthService,
  ],
  exports: [HashingServiceProtocol, JwtModule, ConfigModule],
  controllers: [AuthController],
})
export class AuthModule {}
