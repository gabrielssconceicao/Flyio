import { CreateUserDto } from '../dto';
import { userMock } from './user.mock';
export const generateCreateUserDtoMock = (): CreateUserDto => {
  const dto: CreateUserDto = {
    name: userMock.name,
    username: userMock.username,
    email: userMock.email,
    password: userMock.password,
    bio: userMock.bio,
  };

  return dto;
};
