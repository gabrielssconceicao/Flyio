import { ArgumentMetadata, Injectable } from '@nestjs/common';
import { FileValidatorPipe } from './file-validator.pipe';

@Injectable()
export class PostImagesValidatorPipe extends FileValidatorPipe {
  constructor() {
    super(10 * 1024, 10 * 1024 * 1024, ['image/jpeg', 'image/png']);
  }

  transform(values: Express.Multer.File[], metadata: ArgumentMetadata) {
    if (!Array.isArray(values) || values.length === 0) {
      return [];
    }

    values.forEach((value) => this.validateFile(value));

    return values;
  }
}
