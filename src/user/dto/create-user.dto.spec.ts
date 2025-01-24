<<<<<<< HEAD
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import userMock from 'src/mocks/user.mock';

const fillDto = (dto: CreateUserDto) => {
  dto.name = userMock.name;
  dto.email = userMock.email;
  dto.password = userMock.password;
  return dto;
};

describe('<CreateUserDto>', () => {
  it('should create a valid DTO without bio and profileImg', async () => {
    const dto = new CreateUserDto();
    fillDto(dto);

=======
import { validate, ValidationError } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
function formatErrors(errors: ValidationError[]) {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    value: error.value,
  }));
}
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
>>>>>>> images
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

<<<<<<< HEAD
  describe('<Property: Name />', () => {
    it('should fail if name is empty', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.name = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
    });
    it('should fail if name is too short', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.name = 'Jo';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
    });
    it('should fail if name is too long', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.name = 'Bob'.repeat(100);

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('name');
    });
  });

  describe('<Property: Email />', () => {
    it('should fail if email is invalid', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.email = 'invalid-email';
=======
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
      dto.name = 'Jonh'.repeat(100);
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
      dto.username = 'jDoe42'.repeat(100);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('username');
      expect(formatErrors(errors)).toMatchSnapshot();
    });
  });

  describe('<Property: Email>', () => {
    it('should fail if email is empty', async () => {
      dto.email = null;
>>>>>>> images

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
<<<<<<< HEAD
    });
  });

  describe('<Property: Password />', () => {
    it('should fail if password is empty', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
    });
    it('should fail if password is too short', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.password = '1234';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
    });
    it('should fail if password is too long', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.password = '1'.repeat(256);

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('<Property: Bio />', () => {
    it('should create a DTO with bio', async () => {
      const createDto = new CreateUserDto();
      fillDto(createDto);
      createDto.bio = userMock.bio;
      const errors = await validate(createDto);
      expect(errors.length).toBe(0);
    });
    it('should fail if bio is too long', async () => {
      const dto = new CreateUserDto();
      fillDto(dto);
      dto.bio = 'This is my bio'.repeat(100);

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('bio');
    });
  });
  describe('<Property: ProfileImg />', () => {
    it('should create a DTO with profileImg', async () => {
      const createDto = new CreateUserDto();
      fillDto(createDto);
      createDto.profileImg = userMock.profileImg;
      const errors = await validate(createDto);
      expect(errors.length).toBe(0);
=======
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
      dto.password = '1'.repeat(101);
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
      dto.bio = 'b'.repeat(256);
      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('bio');
      expect(formatErrors(errors)).toMatchSnapshot();
>>>>>>> images
    });
  });
});
