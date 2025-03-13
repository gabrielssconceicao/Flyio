import { validate } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';
import { formatErrors } from '../../common/utils/dto-format.errors';

describe('<CreateCommentDto>', () => {
  let dto: CreateCommentDto;
  beforeEach(() => {
    dto = new CreateCommentDto();
  });
  it('should validate a DTO', async () => {
    dto.content = 'Hello world';
    const result = await validate(dto);
    expect(result.length).toBe(0);
  });

  it('should fail if content is empty', async () => {
    const result = await validate(dto);
    expect(result.length).toBe(1);
    expect(result[0].property).toBe('content');
    expect(formatErrors(result)).toMatchSnapshot();
  });
  it('should fail if content is too long', async () => {
    dto.content = 'A'.repeat(256);
    const result = await validate(dto);
    expect(result.length).toBe(1);
    expect(result[0].property).toBe('content');
    expect(formatErrors(result)).toMatchSnapshot();
  });
});
