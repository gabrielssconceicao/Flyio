import { ApiProperty } from '@nestjs/swagger';

export class FindAllResponseDto<T> {
  @ApiProperty({
    example: 1,
    description: 'Total count of items in the database',
  })
  count: number;

  @ApiProperty({
    description: 'List of items',
    isArray: true,
  })
  items: T[];
}
