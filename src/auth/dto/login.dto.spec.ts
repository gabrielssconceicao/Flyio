import { validate } from 'class-validator';
import { generateLoginDtoMock } from '../mocks/login.dto.mock';
import { LoginDto } from './login.dto';
import { formatErrors } from '../../common/utils/dto-format.errors';
describe('<LoginDto>', () => {
  let dto: LoginDto;
  beforeEach(() => {
    dto = new LoginDto();
    dto.usernameOrEmail = generateLoginDtoMock().usernameOrEmail;
    dto.password = generateLoginDtoMock().password;
  });

  it('should validate a DTO', async () => {
    const errors = await validate(dto);
    console.log({ errors });
    expect(errors.length).toBe(0);
  });

  describe('<Property: usernameOrEmail>', () => {
    it('should fail if is empty', async () => {
      dto.usernameOrEmail = '';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('usernameOrEmail');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });
  describe('<Property: password>', () => {
    it('should fail if is empty', async () => {
      dto.password = '';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });
});
