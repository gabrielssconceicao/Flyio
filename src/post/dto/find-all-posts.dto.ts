import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';
import { FindAllResponseDto } from '../../common/dto/find-all-response.dto';

export class FindAllUsersResponseDto extends FindAllResponseDto<PostEntity> {
  @ApiProperty({
    type: [PostEntity],
    description: 'List of posts of all users',
  })
  items: PostEntity[];
}
