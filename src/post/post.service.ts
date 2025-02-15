import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { TokenPayloadDto } from '../auth/dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    createPostDto: CreatePostDto,
    images: Express.Multer.File[],
    tokenPayload: TokenPayloadDto,
  ) {
    const post = await this.prismaService.post.create({
      data: {
        content: createPostDto.text,
        userId: tokenPayload.sub,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            profileImg: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });
    return post;
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
