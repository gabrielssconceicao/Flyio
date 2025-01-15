export const createUserDtoMock = {
  id: '42-d-f-df4',
  name: 'John Doe',
  username: 'jDoe453',
  email: 'jdoe@me.com',
  password: '123456',
  profileImg: 'https://example.com/profile.jpg',
  bio: 'This is my bio',
};

export const createMockUser = () => {
  return {
    id: createUserDtoMock.id,
    name: createUserDtoMock.name,
    username: createUserDtoMock.username,
    email: createUserDtoMock.email,
    profileImg: createUserDtoMock.profileImg,
    bio: createUserDtoMock.bio,
  };
};
