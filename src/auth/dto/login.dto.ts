import { IsNotEmpty, IsString } from 'class-validator';
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';
export class LoginDto {
  @IsNotEmpty({
    message: dtoErrorMessages('Username or email', DtoErrorType.REQUIRED),
  })
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty({ message: dtoErrorMessages('Password', DtoErrorType.REQUIRED) })
  @IsString()
  password: string;
}
