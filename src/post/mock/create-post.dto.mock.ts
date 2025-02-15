import { CreatePostDto } from '../dto';
export const generateCreatePostDtoMock = (): CreatePostDto => {
  return {
    text: 'Hello world',
  };
};
