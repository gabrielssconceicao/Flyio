import { ApiProperty } from '@nestjs/swagger';

class PostImage {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Post image URL',
  })
  url: string;
  @ApiProperty({ example: 'p-43-5', description: 'Post image identifier' })
  id: string;
}

class UserPost {
  @ApiProperty({ example: 'jDoe453', description: 'User username' })
  username: string;
  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'User profile image URL',
  })
  profileImg: string | null;
}

export class PostEntity {
  @ApiProperty({ example: 'd-43-5df-df4', description: 'Post identifier' })
  id: string;
  @ApiProperty({ example: 'Hello world', description: 'Post text' })
  content: string;
  @ApiProperty({
    example: '2023-03-15 14:30:00',
    description: 'Post creation date',
  })
  createdAt: Date;
  @ApiProperty({ type: UserPost, description: 'Post creator' })
  user: UserPost;
  @ApiProperty({
    description: 'List of post images',
    type: [PostImage],
  })
  images: PostImage[];

  @ApiProperty({ example: 0, description: 'Number of post likes' })
  likes: number;
}
