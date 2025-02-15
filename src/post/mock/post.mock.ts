import { PostEntity } from '../entities/post.entity';

export const postMock: PostEntity = {
  id: '42-d-f-df4',
  content: 'Hello world',
  createdAt: new Date(),
  user: {
    username: 'jDoe453',
    profileImg: 'https://example.com/profile.jpg',
  },
  images: [],
};
