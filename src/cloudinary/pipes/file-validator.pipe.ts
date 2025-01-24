import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  constructor(
    private readonly minSize = 10 * 1024,
    private readonly maxSize = 15 * 1024 * 1024,
    private readonly allowedMimeTypes: string[] = [],
  ) {}
  private throwBadRequest(msg: string): void {
    throw new BadRequestException(msg);
  }
  protected validateFileSize(size: number): void {
    if (size < this.minSize)
      this.throwBadRequest(
        `File too small. Minimum size: ${this.minSize / 1024} KB`,
      );
    if (size > this.maxSize)
      this.throwBadRequest(
        `File too large. Maximum size: ${this.maxSize / (1024 * 1024)} MB`,
      );
  }
  protected validateMimeType(mimetype: string): void {
    if (!this.allowedMimeTypes.includes(mimetype)) {
      this.throwBadRequest(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      return null;
    }
    const { size, mimetype } = value;
    this.validateFileSize(size);
    this.validateMimeType(mimetype);
    return value;
  }
}
