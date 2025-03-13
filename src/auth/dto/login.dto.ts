import { IsNotEmpty, IsString } from 'class-validator';
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({
    example: 'emailOrUsername',
    description: 'Username or email',
  })
  @IsNotEmpty({
    message: dtoErrorMessages('Username or email', DtoErrorType.REQUIRED),
  })
  @IsString()
  login: string;

  @ApiProperty({ example: 'password', description: 'Password' })
  @IsNotEmpty({ message: dtoErrorMessages('Password', DtoErrorType.REQUIRED) })
  @IsString()
  password: string;
}
