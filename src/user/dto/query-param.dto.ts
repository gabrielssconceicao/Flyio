import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryParamDto {
  @ApiProperty({
    description: 'Search query',
    required: false,
    type: String,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiProperty({
    description: 'Limit the number of results',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Offset the number of results',
    required: false,
    type: Number,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
