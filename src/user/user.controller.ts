import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { ProfileImageValidatorPipe } from '../cloudinary/pipes/profile-image-validator.pipe';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryParamDto,
  FindAllUsersResponseDto,
  ReactivateUserDto,
} from './dto';
import { TokenPayloadDto } from '../auth/dto';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create user',
    schema: {
      type: 'object',
      properties: {
        profileImg: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (PNG or JPEG)',
        },
        name: { type: 'string', description: 'Name of the user' },
        email: { type: 'string', description: 'Email of the user' },
        password: { type: 'string', description: 'Password of the user' },
        username: { type: 'string', description: 'Username of the user' },
        bio: { type: 'string', description: 'Bio of the user' },
      },
      required: ['name', 'email', 'password', 'username'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File upload failed due to invalid file type or size limit.',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid file type or file too small/too large',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'This email or username is already associated with an existing account.',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message:
          'This email or username is already associated with an existing account',
        error: 'Conflict',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(
    FileInterceptor('profileImg', {
      storage: multer.memoryStorage(), // Armazenamento do arquivo na memória
    }),
  )
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(ProfileImageValidatorPipe) profileImg: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, profileImg);
  }

  @ApiOperation({ summary: 'Get all users by name or username' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users and the total count',
    type: FindAllUsersResponseDto,
  })
  @ApiAuthResponses()
  @ApiQuery({
    name: 'search',
    description: 'Filter by user name or username',
    required: false,
    type: String,
    example: 'John',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of users to return per page',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of users to skip for pagination',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthTokenGuard)
  @Get()
  findAll(@Query() query: QueryParamDto) {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: 'Get user by username' })
  @ApiParam({
    name: 'username',
    description: 'User username',
    example: 'jDoe45',
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found.',
        error: 'Not Found',
      },
    },
  })
  @ApiAuthResponses()
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user',
    schema: {
      type: 'object',
      properties: {
        profileImg: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (PNG or JPEG)',
        },
        name: { type: 'string', description: 'Name of the user' },
        email: { type: 'string', description: 'Email of the user' },
        password: { type: 'string', description: 'Password of the user' },
        bio: { type: 'string', description: 'Bio of the user' },
      },
    },
  })
  @ApiOperation({ summary: 'Update user by username' })
  @ApiParam({
    name: 'username',
    description: 'User username',
    example: 'jDoe45',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File upload failed due to invalid file type or size limit.',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid file type or file too small/too large',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found.',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
    schema: {
      example: {
        statusCode: HttpStatus.CONFLICT,
        message: 'Email is already associated with an existing account',
        error: 'Conflict',
      },
    },
  })
  @ApiAuthResponses()
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN - You do not have permission',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':username')
  @UseInterceptors(
    FileInterceptor('profileImg', {
      storage: multer.memoryStorage(), // Armazenamento do arquivo na memória
    }),
  )
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(ProfileImageValidatorPipe) profileImg: Express.Multer.File,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.update(
      username,
      updateUserDto,
      profileImg,
      tokenPayload,
    );
  }

  @ApiOperation({ summary: 'Desactivate user by id' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User desactivated successfully.',
    schema: {
      example: {
        message: 'User desactivated successfully.',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User is already deactivated',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User is already deactivated',
        error: 'Bad Request',
      },
    },
  })
  @ApiAuthResponses()
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN - You do not have permission',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':username')
  desactivateUser(
    @Param('username') username: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.desactivateUser(username, tokenPayload);
  }

  @ApiOperation({ summary: 'Delete user profile picture by username' })
  @ApiParam({
    name: 'username',
    description: 'User username',
    example: 'jDoe45',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile picture deleted successfully.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'No profile picture to delete.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error deleting profile picture.',
    schema: {
      example: {
        message: 'Error deleting profile picture.',
      },
    },
  })
  @ApiAuthResponses()
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN - You do not have permission',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN - You do not have permission',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission',
        error: 'Forbidden',
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':username/profile-image')
  removeProfileImg(
    @Param('username') username: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userService.removeProfilePicture(username, tokenPayload);
  }

  @ApiOperation({ summary: 'Reactivate user by token' })
  @ApiBody({
    type: ReactivateUserDto,
    description: 'Reactivate user by token',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account reactivated successfully.',
    schema: {
      example: {
        message: 'Account reactivated successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token.',
    schema: {
      example: {
        message: 'Invalid or expired token',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('reactivate/:token')
  reactivate(@Param() reactivateUserDto: ReactivateUserDto) {
    return this.userService.reactivate(reactivateUserDto);
  }
}
