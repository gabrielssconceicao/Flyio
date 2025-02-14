import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';

export class CreatePostDto {
  @ApiProperty({
    example: 'Hello world',
    description: 'Post text',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty({ message: dtoErrorMessages('Text', DtoErrorType.REQUIRED) })
  @IsString({ message: dtoErrorMessages('Text', DtoErrorType.IS_STRING) })
  @MinLength(1, {
    message: dtoErrorMessages('Text', DtoErrorType.MIN_LENGTH, 1),
  })
  @MaxLength(255, {
    message: dtoErrorMessages('Text', DtoErrorType.MAX_LENGTH, 255),
  })
  text: string;
}
