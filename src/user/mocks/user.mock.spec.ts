import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './user.mock';

describe('<User Mocks/ >', () => {
  it('should generate a valid CreateUserDto mock without bio', () => {
    const dto = generateCreateUserDtoMock();

    expect(dto).toEqual({
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      password: '123456',
    });
  });

  it('should generate a valid CreateUserDto mock with bio', () => {
    const dto = generateCreateUserDtoMock(true);

    expect(dto).toEqual({
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      password: '123456',
      bio: 'This is my bio',
    });
  });

  it('should generate a valid FindAllUsersResponseDto mock', () => {
    const responseDto = generateFindAllUsersResponseDtoMock();

    expect(responseDto).toEqual({
      count: 1,
      users: [
        {
          id: '42-d-f-df4',
          name: 'John Doe',
          username: 'jDoe453',
          profileImg: 'https://example.com/profile.jpg',
        },
      ],
    });
  });

  it('should generate a valid User mock', () => {
    const user = generateUserMock();

    expect(user).toEqual({
      id: '42-d-f-df4',
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      profileImg: 'https://example.com/profile.jpg',
      bio: 'This is my bio',
      active: true,
    });
  });
});
