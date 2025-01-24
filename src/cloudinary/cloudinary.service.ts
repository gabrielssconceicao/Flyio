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

  private readonly profileImageFolder = 'profile-pictures';

  private uploadToCloudinary(
    buffer: Buffer,
    uploadConfig: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a Readable stream from the buffer
        const bufferStream = Readable.from(buffer);

        // Upload config to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadConfig,
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException(
                  'Error uploading/updating profile picture.',
                ),
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
        reject(
          new BadRequestException('Error uploading/updating profile picture.'),
        );
      }
    });
  }

  private getPublicIdFromUrl(url: string): string {
    const urlParts = url.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];

    const filenameParts = filenameWithExtension.split('.');
    const filename = filenameParts[0];

    return filename;
  }

  async uploadProfilePicture(file: Express.Multer.File): Promise<string> {
    const { buffer } = file;

    const renamedFile = `file_${Date.now()}`;

    return this.uploadToCloudinary(buffer, {
      resource_type: 'image',
      folder: 'profile-pictures',
      public_id: renamedFile,
    });
  }

  async updateProfilePicture(
    file: Express.Multer.File,
    prevImgUrl: string,
  ): Promise<string> {
    const { buffer } = file;

    const publicId = this.getPublicIdFromUrl(prevImgUrl);

    return this.uploadToCloudinary(buffer, {
      resource_type: 'image',
      folder: 'profile-pictures',
      public_id: publicId,
      overwrite: true,
    });
  }

  async deleteProfilePicture(profileImgUrl: string) {
    const publicId = this.getPublicIdFromUrl(profileImgUrl);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        `profile-pictures/${publicId}`,
        {
          resource_type: 'image',
          invalidate: true,
        },
        (error) => {
          if (error) {
            reject(new BadRequestException('Error deleting profile picture.'));
          } else {
            resolve(null);
          }
        },
      );
    });
  }

  async uploadPostImage(file: Express.Multer.File): Promise<string> {
    const { mimetype, size, filename } = file;

    // this.checkSize(size, 10 * 1024, 15 * 1024 * 1024);
    // this.validateMimeType(mimetype, ['image/jpeg', 'image/png', 'image/gif']);

    return `Post image uploaded: ${filename}`;
  }
}
