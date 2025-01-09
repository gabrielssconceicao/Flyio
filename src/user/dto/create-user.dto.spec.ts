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

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

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

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('email');
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
    });
  });
});
