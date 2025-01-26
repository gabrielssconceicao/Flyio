import { BadRequestException } from '@nestjs/common';
import { generateFileMock } from '../mock/file.mock';
import { ProfileImageValidatorPipe } from './profile-image-validator.pipe';

describe('<ProfileImageValidatorPipe/ >', () => {
  let pipe: ProfileImageValidatorPipe;
  let file: Express.Multer.File;
  let mimetype: string[];
  beforeEach(() => {
    mimetype = ['image/jpeg', 'image/png'];
    pipe = new ProfileImageValidatorPipe();
    file = generateFileMock();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });
  it('should return the file', () => {
    const result = pipe.transform(file, {} as any);
    expect(result).toEqual(file);
    expect(result).toMatchSnapshot();
  });
  it('should return null if the file is null', () => {
    const result = pipe.transform(null, {} as any);
    expect(result).toBeNull();
    expect(result).toMatchSnapshot();
  });
  it('should throw an error if the file is too small', () => {
    file.size = 9 * 1024;
    expect(() => pipe.transform(file, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(file, {} as any)).toThrow(
      'File too small. Minimum size: 10 KB',
    );
  });
  it('should throw an error if the file is too big', () => {
    file.size = 6 * 1024 * 1024;
    expect(() => pipe.transform(file, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(file, {} as any)).toThrow(
      'File too large. Maximum size: 5 MB',
    );
  });
  it('should throw an error if the file type is not allowed', () => {
    file.mimetype = 'application/pdf';
    expect(() => pipe.transform(file, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(file, {} as any)).toThrow(
      `Invalid file type. Allowed types: ${mimetype.join(', ')}`,
    );
  });
});
