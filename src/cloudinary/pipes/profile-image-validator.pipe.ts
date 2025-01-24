import { Injectable } from '@nestjs/common';
import { FileValidatorPipe } from './file-validator.pipe';

@Injectable()
export class ProfileImageValidatorPipe extends FileValidatorPipe {
  constructor() {
    super(10 * 1024, 5 * 1024 * 1024, ['image/jpeg', 'image/png']);
  }
}
