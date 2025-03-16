import { BadRequestException } from '@nestjs/common';
import { generateFileMock } from '../mocks';
import { PostImagesValidatorPipe } from '../pipes/post-image-validator.pipe';

describe('<PostImagesValidatorPipe/ >', () => {
  let pipe: PostImagesValidatorPipe;
  let files: Express.Multer.File[];
  let mimetype: string[];
  beforeEach(() => {
    mimetype = ['image/jpeg', 'image/png'];
    pipe = new PostImagesValidatorPipe();
    files = [generateFileMock()];
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });
  it('should return the files', () => {
    const result = pipe.transform(files, {} as any);
    expect(result).toEqual(files);
    expect(result).toMatchSnapshot();
  });
  it('should return an empty array if the files is empty', () => {
    const result = pipe.transform([], {} as any);
    expect(result).toEqual([]);
    expect(result).toMatchSnapshot();
  });
  it('should throw an error if the file is too small', () => {
    files[0].size = 9 * 1024;
    expect(() => pipe.transform(files, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(files, {} as any)).toThrow(
      'File too small. Minimum size: 10 KB',
    );
  });
  it('should throw an error if the file is too big', () => {
    files[0].size = 11 * 1024 * 1024;
    expect(() => pipe.transform(files, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(files, {} as any)).toThrow(
      'File too large. Maximum size: 10 MB',
    );
  });
  it('should throw an error if the file type is not allowed', () => {
    files[0].mimetype = 'application/pdf';
    expect(() => pipe.transform(files, {} as any)).toThrow(BadRequestException);
    expect(() => pipe.transform(files, {} as any)).toThrow(
      `Invalid file type. Allowed types: ${mimetype.join(', ')}`,
    );
  });
});
