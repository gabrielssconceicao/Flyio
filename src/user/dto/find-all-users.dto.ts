import { ApiProperty } from '@nestjs/swagger';
import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';
import { FindAllResponseDto } from '../../common/dto/find-all-response.dto';

class UserSummaryDto extends PickType(User, [
  'id',
  'name',
  'username',
  'profileImg',
] as const) {
  @ApiProperty({
    example: 'd-43-5df-df4',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  name: string;

  @ApiProperty({ example: 'jdoe', description: 'Username of the user' })
  username: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
    nullable: true,
  })
  profileImg: string | null;
}

export class FindAllUsersResponseDto extends FindAllResponseDto<UserSummaryDto> {
  @ApiProperty({
    type: [UserSummaryDto],
    description: 'List of users with limited details',
  })
  items: UserSummaryDto[];
}
