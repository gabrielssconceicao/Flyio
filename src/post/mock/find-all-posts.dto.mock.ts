import { FindAllPostsResponseDto } from '../dto/find-all-posts.dto';
import { generatedPostMock } from './post.mock';

export function generateFindAllPostsDtoMock(): FindAllPostsResponseDto {
  return {
    count: 1,
    items: [generatedPostMock()],
  };
}
