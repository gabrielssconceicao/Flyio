import { LoginDto } from '../dto/login.dto';

export const generateLoginDtoMock = (): LoginDto => {
  return {
    login: 'login',
    password: '123456',
  };
};
