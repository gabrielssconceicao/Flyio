import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryParamDto {
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
