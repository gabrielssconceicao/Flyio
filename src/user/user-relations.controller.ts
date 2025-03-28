import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindAllUsersResponseDto } from './dto';
import { UserRelationsService } from './user-relations.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';
import { FindAllUsersPostsResponseDto } from './dto/find-all-user-posts.dto';
import { FindAllLikedPostsResponseDto } from '../post/dto/find-all-liked-post.dto';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';

@ApiTags('Users')
@ApiAuthResponses()
@ApiBearerAuth()
@UseGuards(AuthTokenGuard)
@Controller('users')
export class UserRelationsController {
  constructor(private readonly userRelationsService: UserRelationsService) {}

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
  @HttpCode(HttpStatus.OK)
  @Get(':username/posts')
  getAllPostsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userRelationsService.getAllPostsByUsername(
      username,
      paginationDto,
      tokenPayload,
    );
  }

  @ApiOperation({ summary: 'Get all liked posts of a user' })
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
    example: 'jDoe453',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of liked posts of a user',
    type: FindAllLikedPostsResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':username/posts/liked')
  getAllLikedPostsByUsername(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<FindAllLikedPostsResponseDto> {
    return this.userRelationsService.getAllLikedPostsByUsername(
      username,
      paginationDto,
    );
  }

  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
    example: 'jDoe453',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User followed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User already followed/You cannot follow yourself',
    schema: {
      example: {
        message: 'User already followed/You cannot follow yourself',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Post(':username/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  followUser(
    @Param('username') username: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userRelationsService.followUser(username, tokenPayload);
  }

  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
    example: 'jDoe453',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User unfollowed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'User are not following this user/You cannot unfollow yourself',
    schema: {
      example: {
        message:
          'User are not following this user/You cannot unfollow yourself',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
      },
    },
  })
  @Post(':username/unfollow')
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollowUser(
    @Param('username') username: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userRelationsService.unfollowUser(username, tokenPayload);
  }

  @ApiOperation({ summary: 'Get all followers by user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of users that user follows',
    type: FindAllUsersResponseDto,
  })
  @Get(':username/followers')
  @HttpCode(HttpStatus.OK)
  getAllFollowersByUser(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRelationsService.getAllFollowersByUser(
      username,
      paginationDto,
    );
  }

  @ApiOperation({ summary: 'Get all followed users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return list of users that follow the user',
    type: FindAllUsersResponseDto,
  })
  @Get(':username/followings')
  @HttpCode(HttpStatus.OK)
  getAllFollowingsByUser(
    @Param('username') username: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userRelationsService.getAllFollowingsByUser(
      username,
      paginationDto,
    );
  }
}
