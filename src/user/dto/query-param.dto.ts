import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryParamDto extends PaginationDto {
  @ApiProperty({
    description: 'Search query',
    required: false,
    type: String,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
