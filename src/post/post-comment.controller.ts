import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { PostCommentService } from './post-comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { CommentDto } from './dto';

@ApiTags('Post')
@ApiBearerAuth()
@ApiAuthResponses()
@Controller('post')
@UseGuards(AuthTokenGuard)
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @ApiOperation({ summary: 'Create post comment' })
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'd-43-5df-df4',
    description: 'Post identifier',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CommentDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comment')
  create(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postCommentService.create(postId, body, tokenPayload);
  }

  @ApiOperation({ summary: 'Delete post comment' })
  @ApiParam({
    name: 'commentId',
    type: String,
    example: 'd-43-5df-df4',
    description: 'Comment identifier',
  })
  @ApiParam({
    name: 'postId',
    type: String,
    example: 'd-43-5df-df4',
    description: 'Post identifier',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is trying to delete other user comment',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User is trying to delete other user comment',
        error: 'Forbidden',
      },
    },
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':postId/comment/:commentId')
  delete(
    @Param('commentId') commentId: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postCommentService.delete(commentId, tokenPayload);
  }
}
