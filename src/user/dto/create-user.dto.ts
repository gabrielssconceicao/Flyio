import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
<<<<<<< HEAD
=======
import {
  dtoErrorMessages,
  DtoErrorType,
} from '../../common/utils/dto-error-messages';

>>>>>>> images
export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
    minLength: 3,
<<<<<<< HEAD
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'jdoe@email.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'User password',
    minLength: 6,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password: string;
=======
    maxLength: 100,
  })
  @IsNotEmpty({ message: dtoErrorMessages('Name', DtoErrorType.REQUIRED) })
  @IsString({ message: dtoErrorMessages('Name', DtoErrorType.IS_STRING) })
  @MinLength(3, {
    message: dtoErrorMessages('Name', DtoErrorType.MIN_LENGTH, 3),
  })
  @MaxLength(100, {
    message: dtoErrorMessages('Name', DtoErrorType.MAX_LENGTH, 100),
  })
  name: string;

  @ApiProperty({
    example: 'jDoe453',
    description: 'User username',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: dtoErrorMessages('Username', DtoErrorType.REQUIRED) })
  @IsString({ message: dtoErrorMessages('Username', DtoErrorType.IS_STRING) })
  @MinLength(3, {
    message: dtoErrorMessages('Username', DtoErrorType.MIN_LENGTH, 3),
  })
  @MaxLength(100, {
    message: dtoErrorMessages('Username', DtoErrorType.MAX_LENGTH, 100),
  })
  username: string;

  @ApiProperty({
    example: 'jdoe@me.com',
    description: 'User email',
  })
  @IsEmail()
  @IsNotEmpty({ message: dtoErrorMessages('Email', DtoErrorType.REQUIRED) })
  email: string;

  @ApiProperty({
    example: 'exampl3P@ssw0rd',
    description: 'User password',
    minLength: 6,
    maxLength: 100,
  })
  @IsNotEmpty({ message: dtoErrorMessages('Password', DtoErrorType.REQUIRED) })
  @IsString({ message: dtoErrorMessages('Password', DtoErrorType.IS_STRING) })
  @MinLength(6, {
    message: dtoErrorMessages('Password', DtoErrorType.MIN_LENGTH, 6),
  })
  @MaxLength(100, {
    message: dtoErrorMessages('Password', DtoErrorType.MAX_LENGTH, 100),
  })
  password: string; // change prisma to passwordHash
>>>>>>> images

  @ApiProperty({
    example: 'This is my bio',
    description: 'User bio',
    maxLength: 255,
<<<<<<< HEAD
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @ApiProperty({
    example: 'example.png',
    description: 'User profile image',
  })
  @IsOptional()
  @IsString()
  profileImg?: string;
=======
    required: false,
  })
  @IsOptional()
  @IsString({ message: dtoErrorMessages('Bio', DtoErrorType.IS_STRING) })
  @MaxLength(255, {
    message: dtoErrorMessages('Bio', DtoErrorType.MAX_LENGTH, 255),
  })
  bio?: string;
>>>>>>> images
}
