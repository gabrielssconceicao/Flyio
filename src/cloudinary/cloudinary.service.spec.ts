import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';
import { generateFileMock } from './mocks';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('<CloudinaryService />', () => {
  let service: CloudinaryService;
  let mockFile: Express.Multer.File;
  let mockUrl: string;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    mockFile = generateFileMock();
    mockUrl = 'https://mock.cloudinary.com/image/profile_12345.jpg';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('<UploadProfilePicture />', () => {
    it('should upload profile picture and return the secure URL', async () => {
      const uploadStreamMock = jest.fn((options, callback) => {
        callback(null, { secure_url: mockUrl });
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;

      const result = await service.uploadProfilePicture(mockFile);
      expect(result).toBe(mockUrl);
      expect(uploadStreamMock).toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });

    it('should throw BadRequestException on upload error', async () => {
      const uploadStreamMock = jest.fn((options, callback) => {
        callback(new Error('Upload failed'), null);
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;

      await expect(service.uploadProfilePicture(mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('<UpdateProfilePicture />', () => {
    it('should update profile picture and return the secure URL', async () => {
      const uploadStreamMock = jest.fn((options, callback) => {
        callback(null, { secure_url: mockUrl });
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;

      const result = await service.updateProfilePicture(mockFile, mockUrl);
      expect(result).toBe(mockUrl);
      expect(uploadStreamMock).toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });
    it('should throw BadRequestException on upload error', async () => {
      const uploadStreamMock = jest.fn((options, callback) => {
        callback(new Error('Upload failed'), null);
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;

      await expect(
        service.updateProfilePicture(mockFile, mockUrl),
      ).rejects.toThrow(BadRequestException);
      expect(uploadStreamMock).toHaveBeenCalled();
    });
  });

  describe('<DeleteProfilePicture />', () => {
    it('should delete profile picture', async () => {
      const destroyStreamMock = jest.fn((publicId, options, callback) => {
        callback(null, { result: 'ok' });
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.destroy = destroyStreamMock as any;

      const result = await service.deleteProfilePicture(mockUrl);

      expect(result).toBe(null);
      expect(destroyStreamMock).toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });

    it('should throw BadRequestException on deletion error', async () => {
      const destroyStreamMock = jest.fn((publicId, options, callback) => {
        callback(new Error('Deletion failed'), null);
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.destroy = destroyStreamMock as any;

      await expect(service.deleteProfilePicture(mockUrl)).rejects.toThrow(
        BadRequestException,
      );

      expect(destroyStreamMock).toHaveBeenCalled();
    });
  });

  describe('<UploadPostImages />', () => {
    it('should upload multiple post images and return secure URLs', async () => {
      const mockUrls = [
        'https://mock.cloudinary.com/image/post_1.jpg',
        'https://mock.cloudinary.com/image/post_2.jpg',
        'https://mock.cloudinary.com/image/post_3.jpg',
      ];

      const uploadStreamMock = jest.fn((options, callback) => {
        callback(null, { secure_url: mockUrls.shift() });
        return { pipe: jest.fn() };
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;

      const mockFiles = [
        generateFileMock(),
        generateFileMock(),
        generateFileMock(),
      ];
      const result = await service.uploadPostImages(mockFiles);

      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(mockUrls));
      expect(uploadStreamMock).toHaveBeenCalledTimes(3);
    });

    it('should rollback uploads if one image fails', async () => {
      const mockUrls = [
        'https://mock.cloudinary.com/image/post_1.jpg',
        'https://mock.cloudinary.com/image/post_2.jpg',
      ];

      const uploadStreamMock = jest.fn((options, callback) => {
        if (mockUrls.length) {
          callback(null, { secure_url: mockUrls.shift() });
        } else {
          callback(new Error('Upload failed'), null);
        }
        return { pipe: jest.fn() };
      });

      const deleteMock = jest.fn((publicId, options, callback) => {
        callback(null, { result: 'ok' });
      });

      cloudinary.uploader.upload_stream = uploadStreamMock as any;
      cloudinary.uploader.destroy = deleteMock as any;

      const mockFiles = [
        generateFileMock(),
        generateFileMock(),
        generateFileMock(),
      ];

      await expect(service.uploadPostImages(mockFiles)).rejects.toThrow(
        BadRequestException,
      );

      expect(uploadStreamMock).toHaveBeenCalledTimes(3);
      expect(deleteMock).toHaveBeenCalledTimes(2); // Deveria remover as imagens já enviadas
    });
  });
});
