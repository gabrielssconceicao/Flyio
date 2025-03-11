import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';

@Module({
  controllers: [PostController, PostCommentController],
  providers: [PostService, PostCommentService],
})
export class PostModule {}
