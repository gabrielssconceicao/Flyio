import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashingServiceProtocol } from './hashing/hashing.service';

@Injectable()
export class BcryptService implements HashingServiceProtocol {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
