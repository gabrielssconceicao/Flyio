import { User } from '../entities/user.entity';

export const userMock = {
  id: '42-d-f-df4',
  name: 'John Doe',
  username: 'jDoe453',
  email: 'jdoe@me.com',
  password: '123456',
  profileImg: 'https://example.com/profile.jpg',
  bio: 'This is my bio',
  active: true,
};
export const generateUserMock = (): User => {
  return {
    id: userMock.id,
    name: userMock.name,
    username: userMock.username,
    profileImg: userMock.profileImg,
    bio: userMock.bio,
    active: userMock.active,
    followers: 0,
    following: 0,
  };
};
