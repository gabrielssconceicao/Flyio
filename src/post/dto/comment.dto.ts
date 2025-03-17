import { ApiProperty } from '@nestjs/swagger';

class UserComment {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiProperty({ example: 'jdoe', description: 'User username' })
  username: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'User profile image URL',
  })
  profileImg: string | null;
}

export class CommentDto {
  @ApiProperty({ example: 'd-43-5df-df4', description: 'Comment identifier' })
  id: string;

  @ApiProperty({ example: 'Hello world', description: 'Comment content' })
  content: string;

  @ApiProperty({ example: '2023-03-15 14:30:00', description: 'Comment date' })
  createdAt: Date;

  @ApiProperty({ type: UserComment, description: 'Comment creator' })
  user: UserComment;
}
