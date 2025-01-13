import * as bcrypt from 'bcryptjs';
import { HashingServiceProtocol } from './hashing/hashing.service';

export class BcryptService extends HashingServiceProtocol {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
