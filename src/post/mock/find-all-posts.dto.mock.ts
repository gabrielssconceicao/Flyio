import { FindAllPostsResponseDto } from '../dto/find-all-posts.dto';
import { postMock } from './post.mock';

export function generateFindAllPostsDtoMock(): FindAllPostsResponseDto {
  return {
    count: 1,
    items: [postMock],
  };
}
