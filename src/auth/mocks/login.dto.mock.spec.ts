import { generateLoginDtoMock } from './login.dto.mock';

describe('<LoginDtoMock>', () => {
  it('should generate a valid login dto mock', () => {
    const result = generateLoginDtoMock();

    expect(result).toEqual(
      expect.objectContaining({
        login: 'login',
        password: '123456',
      }),
    );
    expect(result).toMatchSnapshot();
  });
});
