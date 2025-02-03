import { generateFileMock } from './file.mock';

describe('<FileMocks />', () => {
  it('should generate a valid file mock', () => {
    const result = generateFileMock();

    expect(result).toEqual({
      mimetype: 'image/jpeg',
      size: 10 * 1024,
      originalname: 'image.jpg',
      buffer: Buffer.from('test'),
    });
    expect(result).toMatchSnapshot();
  });
  it('should have expected properties', () => {
    const file = generateFileMock();
    const expectedProperties = ['mimetype', 'size', 'originalname', 'buffer'];
    expectedProperties.forEach((property) => {
      expect(file).toHaveProperty(property);
    });
  });
});
