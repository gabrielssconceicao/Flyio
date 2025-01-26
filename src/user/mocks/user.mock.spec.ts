import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './user.mock';

describe('<UserMocks/ >', () => {
  let expectedProperties: string[];
  beforeEach(() => {
    expectedProperties = [];
  });
  it('should generate a valid CreateUserDto mock without bio', () => {
    const dto = generateCreateUserDtoMock();
    expectedProperties = ['name', 'username', 'email', 'password'];
    expect(dto).toEqual({
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      password: '123456',
    });
    expectedProperties.forEach((property) => {
      expect(dto).toHaveProperty(property);
    });
    expect(dto).toMatchSnapshot();
  });

  it('should generate a valid CreateUserDto mock with bio', () => {
    const dto = generateCreateUserDtoMock(true);
    expectedProperties = ['name', 'username', 'email', 'password', 'bio'];
    expect(dto).toEqual({
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      password: '123456',
      bio: 'This is my bio',
    });
    expectedProperties.forEach((property) => {
      expect(dto).toHaveProperty(property);
    });
    expect(dto).toMatchSnapshot();
  });

  it('should generate a valid FindAllUsersResponseDto mock', () => {
    const responseDto = generateFindAllUsersResponseDtoMock();
    expectedProperties = ['count', 'users'];
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
    expectedProperties.forEach((property) => {
      expect(responseDto).toHaveProperty(property);
    });
    expect(responseDto).toMatchSnapshot();
  });

  it('should generate a valid User mock', () => {
    const user = generateUserMock();
    expectedProperties = [
      'id',
      'name',
      'username',
      'email',
      'profileImg',
      'bio',
      'active',
    ];
    expect(user).toEqual({
      id: '42-d-f-df4',
      name: 'John Doe',
      username: 'jDoe453',
      email: 'jdoe@me.com',
      profileImg: 'https://example.com/profile.jpg',
      bio: 'This is my bio',
      active: true,
    });
    expectedProperties.forEach((property) => {
      expect(user).toHaveProperty(property);
    });
    expect(user).toMatchSnapshot();
  });
});
