import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    example: 'd-43-5df-df4',
    description: 'Unique identifier of the user',
  })
  id: string;
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  name: string;
  @ApiProperty({ example: 'jdoe', description: 'Username of the user' })
  username: string;
  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile image URL',
    nullable: true,
  })
  profileImg: string | null;
  @ApiProperty({
    example: 'This is my bio',
    description: 'Biography of the user',
    nullable: true,
  })
  bio: string | null;
  @ApiProperty({ example: true, description: 'User status' })
  active: boolean;
}
