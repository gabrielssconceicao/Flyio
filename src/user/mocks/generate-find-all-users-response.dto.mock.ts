import { FindAllUsersResponseDto } from '../dto';
import { userMock } from './user.mock';

export const generateFindAllUsersResponseDtoMock =
  (): FindAllUsersResponseDto => {
    return {
      count: 1,
      items: [
        {
          id: userMock.id,
          name: userMock.name,
          username: userMock.username,
          profileImg: userMock.profileImg,
        },
      ],
    };
  };
