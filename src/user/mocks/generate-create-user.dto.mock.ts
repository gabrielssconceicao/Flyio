import { CreateUserDto } from '../dto';
import { userMock } from './user.mock';
export const generateCreateUserDtoMock = (
  bio: boolean = false,
): CreateUserDto => {
  const dto: CreateUserDto = {
    name: userMock.name,
    username: userMock.username,
    email: userMock.email,
    password: userMock.password,
  };

  if (bio) dto.bio = userMock.bio;
  return dto;
};
