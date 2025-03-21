import { validate } from 'class-validator';
import { CreateUserDto } from '../../dto';
import { formatErrors } from 'src/common/utils/dto-format.errors';
describe('<CreateUserDto>', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();

    dto.name = 'John Doe';
    dto.username = 'jDoe453';
    dto.email = 'jdoe@me.com';
    dto.password = 'exampl3P@ssw0rd';
    dto.bio = 'This is my bio';
  });

  it('should validate a DTO', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('<Property: Name>', () => {
    it('should fail if name is empty', async () => {
      dto.name = '';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if name is too short', async () => {
      dto.name = 'Jo';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if name is too long', async () => {
      dto.name = 'Jonh'.repeat(51);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });

  describe('<Property: Username>', () => {
    it('should fail if username is empty', async () => {
      dto.username = null;
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('username');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if username is too short', async () => {
      dto.username = 'jD';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('username');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if username is too long', async () => {
      dto.username = 'jDoe42'.repeat(51);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('username');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });

  describe('<Property: Email>', () => {
    it('should fail if email is empty', async () => {
      dto.email = null;

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if email is not valid', async () => {
      dto.email = 'jdoe@me';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });

  describe('<Property: Password>', () => {
    it('should fail if password is empty', async () => {
      dto.password = null;
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if password is too short', async () => {
      dto.password = '12345';
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
    it('should fail if password is too long', async () => {
      dto.password = '1'.repeat(51);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });

  describe('<Property: Bio>', () => {
    it('should validate a DTO if bio is not send', async () => {
      dto.bio = undefined;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    it('should validate a DTO if bio too long', async () => {
      dto.bio = 'b'.repeat(101);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('bio');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });
});
