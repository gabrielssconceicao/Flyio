import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
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

  private renameFile(filename: string): string {
    const extension = filename.split('.').pop();
    const timestamp = Date.now();
    console.log({ extension, timestamp });
    return `file_${timestamp}.${extension}`;
  }

  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    console.log('Entrrei');
    const { mimetype, size, originalname, buffer } = file;

    // Realizar as verificações de tamanho e tipo de mime
    this.checkSize(size, 10 * 1024, 5 * 1024 * 1024);
    this.validateMimeType(mimetype, ['image/jpeg', 'image/png']);

    const renamedFile = this.renameFile(originalname);

    return new Promise((resolve, reject) => {
      try {
        // Create a Readable stream from the buffer
        const bufferStream = Readable.from(buffer);

        // Upload config to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'profile-pictures',
            public_id: renamedFile,
          },
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException('Error uploading profile picture.'),
              );
            } else {
              // Retornar a URL segura da imagem após o upload
              resolve(result.secure_url);
            }
          },
        );

        // Passar o stream para o upload
        bufferStream.pipe(uploadStream);
      } catch {
        reject(new BadRequestException('Error uploading profile picture.'));
      }
    });
  }

  async uploadPostImage(file: Express.Multer.File): Promise<string> {
    const { mimetype, size, filename } = file;

    this.checkSize(size, 10 * 1024, 15 * 1024 * 1024);
    this.validateMimeType(mimetype, ['image/jpeg', 'image/png', 'image/gif']);

    return `Post image uploaded: ${filename}`;
  }
}
