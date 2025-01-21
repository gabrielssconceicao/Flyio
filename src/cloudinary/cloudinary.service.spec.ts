import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { generateFileMock } from '../mocks/data/file.mock';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('<CloudinaryService />', () => {
  let service: CloudinaryService;
  let mockFile: Express.Multer.File;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    mockFile = generateFileMock();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('<UploadProfilePicture />', () => {
    it('should upload profile picture and return the secure URL', async () => {
      const mockUrl =
        'https://mocked.cloudinary.com/image/upload/v1/profile-pictures/file_12345.jpg';

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
});
