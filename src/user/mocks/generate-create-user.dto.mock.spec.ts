import { userMock } from './user.mock';
import { generateCreateUserDtoMock } from './generate-create-user.dto.mock';
describe('<CreateUserDtoMock>', () => {
  it('should generate a valid create user dto mock with bio', () => {
    const result = generateCreateUserDtoMock(true);

    expect(result).toEqual(
      expect.objectContaining({
        name: userMock.name,
        username: userMock.username,
        email: userMock.email,
        password: userMock.password,
        bio: userMock.bio,
      }),
    );

    expect(result).toMatchSnapshot();
  });
  it('should generate a valid create user dto mock with no bio', () => {
    const result = generateCreateUserDtoMock();

    expect(result).toEqual(
      expect.objectContaining({
        name: userMock.name,
        username: userMock.username,
        email: userMock.email,
        password: userMock.password,
      }),
    );

    expect(result).toMatchSnapshot();
  });
});
