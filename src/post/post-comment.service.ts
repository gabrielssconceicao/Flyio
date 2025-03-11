import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenPayloadDto } from '../auth/dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostCommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    tokenPayload: TokenPayloadDto,
  ) {
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
}
