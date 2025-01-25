import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    AuthService,
  ],
  exports: [HashingServiceProtocol],
  controllers: [AuthController],
})
export class AuthModule {}
