import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { FindAllUsersResponseDto } from 'src/user/dto/find-all-users.dto';
import { User } from 'src/user/entities/user.entity';

const userMock = {
  id: '42-d-f-df4',
  name: 'John Doe',
  username: 'jDoe453',
  email: 'jdoe@me.com',
  password: '123456',
  profileImg: 'https://example.com/profile.jpg',
  bio: 'This is my bio',
  active: true,
};

export const generateCreateUserDtoMock = (
  bio: boolean = false,
  profileImg: boolean = false,
): CreateUserDto => {
  const dto: CreateUserDto = {
    name: userMock.name,
    username: userMock.username,
    email: userMock.email,
    password: userMock.password,
  };

  if (bio) dto.bio = userMock.bio;
  if (profileImg) dto.profileImg = userMock.profileImg;
  return dto;
};

export const generateFindAllUsersResponseDtoMock =
  (): FindAllUsersResponseDto => {
    return {
      count: 1,
      users: [
        {
          id: userMock.id,
          name: userMock.name,
          username: userMock.username,
          profileImg: userMock.profileImg,
        },
      ],
    };
  };

export const generateUserMock = (): User => {
  return {
    id: userMock.id,
    name: userMock.name,
    username: userMock.username,
    email: userMock.email,
    profileImg: userMock.profileImg,
    bio: userMock.bio,
    active: userMock.active,
  };
};
