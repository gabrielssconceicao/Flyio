import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
@Module({
  imports: [],
  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
  ],
  exports: [HashingServiceProtocol],
})
export class AuthModule {}
