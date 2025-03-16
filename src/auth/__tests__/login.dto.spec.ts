import { validate } from 'class-validator';
import { generateLoginDtoMock } from '../mocks';
import { LoginDto } from '../dto';
import { formatErrors } from 'src/common/utils/dto-format.errors';
describe('<LoginDto>', () => {
  let dto: LoginDto;
  beforeEach(() => {
    dto = new LoginDto();
    dto.login = generateLoginDtoMock().login;
    dto.password = generateLoginDtoMock().password;
  });

  it('should validate a DTO', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('<Property: login>', () => {
    it('should fail if is empty', async () => {
      dto.login = '';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('login');
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
