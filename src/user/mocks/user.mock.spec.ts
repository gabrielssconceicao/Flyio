import { userMock, generateUserMock } from './user.mock';

describe('<UserMocks />', () => {
  it('should generate a valid user mock', () => {
    const result = generateUserMock();

    expect(result).toEqual(
      expect.objectContaining({
        id: userMock.id,
        name: userMock.name,
        username: userMock.username,

        profileImg: userMock.profileImg,
        bio: userMock.bio,
        active: userMock.active,
      }),
    );

    expect(result).toMatchSnapshot();
  });
});
