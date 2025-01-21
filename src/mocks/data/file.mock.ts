export const generateFileMock = () => {
  return {
    mimetype: 'image/jpeg',
    size: 1024,
    originalname: 'image.jpg',
    buffer: Buffer.from('test'),
  } as Express.Multer.File;
};

export const generatedProfilePictureMock = 'https://example.com/profile.jpg';
