import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';

export class ReactivateUserDto {
  @ApiProperty({
    example: 'krcio48hgGYIFYJfuyfJYAYu',
    description: 'Activation token',
  })
  @IsNotEmpty({ message: dtoErrorMessages('Token', DtoErrorType.REQUIRED) })
  @IsString()
  token: string;
}
