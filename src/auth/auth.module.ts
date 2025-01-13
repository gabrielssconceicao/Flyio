import { Global, Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { HashingServiceProtocol } from './hashing/hashing.service';

@Global()
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
