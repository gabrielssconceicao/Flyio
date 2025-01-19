import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  private throwBadRequest(msg: string): void {
    throw new BadRequestException(msg);
  }

  private checkSize(size: number, minSize: number, maxSize: number): void {
    if (size < minSize)
      this.throwBadRequest(
        `File too small. Minimum size: ${minSize / 1024} KB`,
      );
    if (size > maxSize)
      this.throwBadRequest(
        `File too large. Maximum size: ${maxSize / (1024 * 1024)} MB`,
      );
  }

  private validateMimeType(mimetype: string, allowedTypes: string[]): void {
    if (!allowedTypes.includes(mimetype)) {
      this.throwBadRequest(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    const { mimetype, size, filename } = file;

    this.checkSize(size, 10 * 1024, 5 * 1024 * 1024);
    this.validateMimeType(mimetype, ['image/jpeg', 'image/png']);

    // Simulação de uploa
    return `Profile picture uploaded: ${filename}`;
  }

  async uploadPostImage(file: Express.Multer.File): Promise<string> {
    const { mimetype, size, filename } = file;

    this.checkSize(size, 10 * 1024, 15 * 1024 * 1024);
    this.validateMimeType(mimetype, ['image/jpeg', 'image/png', 'image/gif']);

    return `Post image uploaded: ${filename}`;
  }
}
