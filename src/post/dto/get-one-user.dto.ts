import { ApiProperty } from '@nestjs/swagger';
import { PostEntity } from '../entities/post.entity';
import { CommentDto } from './comment.dto';

export class GetOnePostDto extends PostEntity {
  @ApiProperty({
    isArray: true,
    description: 'List of comments',
  })
  comments: CommentDto[];
}
