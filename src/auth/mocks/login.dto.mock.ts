import { LoginDto } from '../dto/login.dto';

export const generateLoginDtoMock = (): LoginDto => {
  return {
    usernameOrEmail: 'usernameOrEmail',
    password: '123456',
  };
};
