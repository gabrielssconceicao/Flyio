import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { FindAllLikedPostsResponseDto } from '../post/dto/find-all-liked-post.dto';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';

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
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthTokenGuard)
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
  @ApiAuthResponses()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthTokenGuard)
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
    status: HttpStatus.CREATED,
    description: 'User followed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User already followed/You cannot follow yourself',
    schema: {
      example: {
        message: 'User already followed/You cannot follow yourself',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
      },
    },
  })
  @ApiAuthResponses()
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @Post(':username/follow')
  @HttpCode(HttpStatus.CREATED)
  followUser(
    @Param('username') username: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.userRelationsService.followUser(username, tokenPayload);
  }
}
