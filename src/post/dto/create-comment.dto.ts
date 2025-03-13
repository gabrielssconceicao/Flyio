import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Hello world',
    description: 'Comment text',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty({ message: dtoErrorMessages('Content', DtoErrorType.REQUIRED) })
  @IsString({ message: dtoErrorMessages('Content', DtoErrorType.IS_STRING) })
  @MinLength(1, {
    message: dtoErrorMessages('Content', DtoErrorType.MIN_LENGTH, 1),
  })
  @MaxLength(255, {
    message: dtoErrorMessages('Content', DtoErrorType.MAX_LENGTH, 255),
  })
  content: string;
}
