import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReactivateUserDto } from './dto';
import { UserRelationsService } from './user-relations.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';
import { FindAllUsersPostsResponseDto } from './dto/find-all-user-posts.dto';

@ApiTags('Users')
@Controller('users')
export class UserRelationsController {
  constructor(private readonly userRelationsService: UserRelationsService) {}

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
  @Patch('reactivate/:token')
  reactivate(@Param() reactivateUserDto: ReactivateUserDto) {
    return this.userRelationsService.reactivate(reactivateUserDto);
  }

  @ApiOperation({ summary: 'Get all posts of a user by username' })
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
    example: 'jDoe453',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of posts of a user with limited details',
    type: FindAllUsersPostsResponseDto,
  })
  @ApiAuthResponses()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthTokenGuard)
  @Get(':username/posts')
  getAllPostsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRelationsService.getAllPostsByUsername(
      username,
      paginationDto,
    );
  }
}
