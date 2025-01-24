import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
<<<<<<< HEAD
=======
  HttpStatus,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
>>>>>>> images
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
<<<<<<< HEAD

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  /*
 @ApiOperation({ summary: 'Criar um novo recado' }) // Descrição da operação
  @ApiResponse({
    status: 204,
    description: 'Recado criado com sucesso.',
    type: ResponseRecadoDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.',
    type: BadRequestException,
    example: new BadRequestException('Error Message').getResponse(),
  })
*/
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /*
  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Listar todos os recados' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade de itens por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Recados listados com sucesso',
    type: [ResponseRecadoDto],
  })
  */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
=======
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { QueryParamDto } from './dto/query-param.dto';
import { FindAllUsersResponseDto } from './dto/find-all-users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ProfileImageValidatorPipe } from '../cloudinary/pipes/profile-image-validator.pipe';
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'File upload failed due to invalid file type.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid file type',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File upload failed due to size limit.',
    schema: {
      example: {
        statusCode: 400,
        message: 'File too small or too large',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'This email or username is already associated with an existing account.',
    schema: {
      example: {
        statusCode: 409,
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

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users by name or username' })
  @ApiResponse({
    status: 200,
    description: 'List of users and the total count',
    type: FindAllUsersResponseDto,
  })
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
  @Get()
  findAll(@Query() query: QueryParamDto) {
    return this.userService.findAll(query);
  }

  @HttpCode(HttpStatus.OK)
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
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.userService.findOne(username);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user by username' })
  @ApiParam({
    name: 'username',
    description: 'User username',
    example: 'jDoe45',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'File upload failed due to invalid file type.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid file type',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File upload failed due to size limit.',
    schema: {
      example: {
        statusCode: 400,
        message: 'File too small or too large',
        error: 'Bad Request',
      },
    },
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
  @ApiResponse({
    status: 409,
    description: 'Email already in use',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email is already associated with an existing account',
        error: 'Conflict',
      },
    },
  })
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
  ) {
    // change to id
    return this.userService.update(username, updateUserDto, profileImg);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: 200,
    description: 'User not found.',
    schema: {
      example: {
        message: 'User deleted successfully.',
      },
    },
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: 'Delete user profile picture by username' })
  @ApiParam({
    name: 'username',
    description: 'User username',
    example: 'jDoe45',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture deleted successfully.',
    type: User, //field profileImg
  })
  @ApiResponse({
    status: 200,
    description: 'No profile picture to delete.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Error deleting profile picture.',
    schema: {
      example: {
        message: 'Error deleting profile picture.',
      },
    },
  })
  @Delete(':username/profile-img')
  removeProfileImg(@Param('username') username: string) {
    return this.userService.removeProfilePicture(username);
>>>>>>> images
  }
}
