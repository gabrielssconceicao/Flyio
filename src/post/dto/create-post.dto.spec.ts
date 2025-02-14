import { validate } from 'class-validator';
import { CreatePostDto } from './create-post.dto';
import { formatErrors } from '../../common/utils/dto-format.errors';

describe('<CreatePostDto>', () => {
  let dto: CreatePostDto;
  beforeEach(() => {
    dto = new CreatePostDto();
  });
  it('should validate a DTO', async () => {
    dto.text = 'Hello world';
    const result = await validate(dto);
    expect(result.length).toBe(0);
  });

  it('should fail if text is empty', async () => {
    const result = await validate(dto);
    expect(result.length).toBe(1);
    expect(result[0].property).toBe('text');
    expect(formatErrors(result)).toMatchSnapshot();
  });
  it('should fail if text is too long', async () => {
    dto.text = 'A'.repeat(256);
    const result = await validate(dto);
    expect(result.length).toBe(1);
    expect(result[0].property).toBe('text');
    expect(formatErrors(result)).toMatchSnapshot();
  });
});
