import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PostCommentService } from './post-comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';

@Controller('post')
@ApiBearerAuth()
@ApiAuthResponses()
@UseGuards(AuthTokenGuard)
export class PostCommentController {
  constructor(private readonly postCommentService: PostCommentService) {}

  @ApiOperation({ summary: 'Create post comment' })
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comment')
  create(
    @Param('postId') postId: string,
    @Body() body: CreateCommentDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postCommentService.create(postId, body, tokenPayload);
  }
}
