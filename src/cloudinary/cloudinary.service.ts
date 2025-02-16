import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly postImagesFolder = 'posts';
  private readonly profileImagesFolder = 'profile-pictures';
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

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
      folder: this.profileImagesFolder,
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
      folder: this.profileImagesFolder,
      public_id: publicId,
      overwrite: true,
    });
  }

  async deleteProfilePicture(profileImgUrl: string) {
    return this.deletePicture(profileImgUrl, this.profileImagesFolder);
  }

  private async deletePicture(profileImgUrl: string, folder: string) {
    const publicId = this.getPublicIdFromUrl(profileImgUrl);
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        `${folder}/${publicId}`,
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

  async uploadPostImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadedImages: string[] = [];

    try {
      await Promise.all(
        files.map(async (file) => {
          const { buffer } = file;
          const renamedFile = `file_${Date.now()}${Math.floor(Math.random() * 10) + 1}`;

          const imageUrl = await this.uploadToCloudinary(buffer, {
            resource_type: 'image',
            folder: 'posts',
            public_id: renamedFile,
          });

          uploadedImages.push(imageUrl);
        }),
      );

      return uploadedImages;
    } catch {
      await Promise.all(
        uploadedImages.map((url) =>
          this.deletePicture(url, this.postImagesFolder),
        ),
      );

      throw new BadRequestException(
        'Error uploading post images. All uploads have been rolled back.',
      );
    }
  }
}
