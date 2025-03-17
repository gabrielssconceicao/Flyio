import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenPayloadDto } from '../auth/dto';
import { PermissionService } from '../permission/permission.service';
import { CommentDto, CreateCommentDto } from './dto';

@Injectable()
export class PostCommentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionService: PermissionService,
  ) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<CommentDto> {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comment = await this.prismaService.comment.create({
      data: {
        content: createCommentDto.content,
        userId: tokenPayload.sub,
        postId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            username: true,
            profileImg: true,
          },
        },
      },
    });

    return comment;
  }

  async delete(
    commentId: string,
    tokenPayload: TokenPayloadDto,
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    this.permissionService.verifyUserOwnership(
      tokenPayload.sub,
      comment.userId,
    );

    await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }
}
