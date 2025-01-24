import { BadRequestException } from '@nestjs/common';
import { generateFileMock } from '../../mocks/data/file.mock';
import { FileValidatorPipe } from './file-validator.pipe';

describe('<FileValidatorPipe />', () => {
  let pipe: FileValidatorPipe;
  let file: Express.Multer.File;
  let mimetype: string[];
  beforeEach(() => {
    mimetype = ['image/jpeg', 'image/png'];
    pipe = new FileValidatorPipe(10 * 1024, 15 * 1024 * 1024, mimetype);
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
    file.size = 20 * 1024 * 1024;
    expect(() => pipe.transform(file, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(file, {} as any)).toThrow(
      'File too large. Maximum size: 15 MB',
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
