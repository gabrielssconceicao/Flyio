import { generateLoginDtoMock } from './login.dto.mock';

describe('<LoginDtoMock>', () => {
  it('should generate a valid login dto mock', () => {
    const result = generateLoginDtoMock();
    const properties = ['login', 'password'];
    properties.forEach((property) => {
      expect(result).toHaveProperty(property);
    });
    expect(result).toEqual({
      login: 'login',
      password: '123456',
    });
    expect(result).toMatchSnapshot();
  });
});
