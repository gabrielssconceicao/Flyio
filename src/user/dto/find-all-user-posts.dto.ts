import { ApiProperty, OmitType } from '@nestjs/swagger';
import { FindAllResponseDto } from 'src/common/dto/find-all-response.dto';
import { PostEntity } from '../../post/entities/post.entity';

export class FindAllUsersPostsResponseDto extends FindAllResponseDto<
  Omit<PostEntity, 'user'>
> {
  @ApiProperty({
    type: [OmitType(PostEntity, ['user'])],
    description: 'List of posts of a user with limited details',
  })
  items: Omit<PostEntity, 'user'>[];
}
