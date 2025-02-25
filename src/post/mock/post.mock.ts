import { PostEntity } from '../entities/post.entity';

export const postMock: PostEntity = {
  id: '42-d-f-df4',
  content: 'Hello world',
  createdAt: new Date(Date.parse('2023-03-15 14:30:00')),
  user: {
    username: 'jDoe453',
    profileImg: 'https://example.com/profile.jpg',
  },
  images: [],
  likes: 0,
};
