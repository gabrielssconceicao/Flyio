import { ApiProperty } from '@nestjs/swagger';
import { FindAllResponseDto } from '../../common/dto/find-all-response.dto';
import { PostEntity } from '../../post/entities/post.entity';

export class FindAllUsersPostsResponseDto extends FindAllResponseDto<PostEntity> {
  @ApiProperty({
    type: [PostEntity],
    description: 'List of posts of a user with limited details',
  })
  items: PostEntity[];
}
