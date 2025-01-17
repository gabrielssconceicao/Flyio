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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
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
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
  update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // change to id
    return this.userService.update(username, updateUserDto);
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
}
