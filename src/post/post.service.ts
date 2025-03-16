import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { TokenPayloadDto } from '../auth/dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FindAllPostsResponseDto } from './dto/find-all-posts.dto';
import { PostEntity } from './entities/post.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly permissionService: PermissionService,
  ) {}

  private selectPostFields = {
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
    _count: {
      select: {
        PostLikes: true,
        comments: true,
      },
    },
  };

  async create(
    createPostDto: CreatePostDto,
    images: Express.Multer.File[],
    tokenPayload: TokenPayloadDto,
  ): Promise<PostEntity> {
    let postImagesUrl: string[] = [];
    if (images.length) {
      postImagesUrl = await this.cloudinaryService.uploadPostImages(images);
    }
    const { _count, ...post } = await this.prismaService.post.create({
      data: {
        content: createPostDto.text,
        userId: tokenPayload.sub,
        images: {
          createMany: {
            data: postImagesUrl.map((url) => ({ url })),
          },
        },
      },
      select: this.selectPostFields,
    });
    return { ...post, likes: _count.PostLikes, liked: false, commentsCount: 0 };
  }

  async findAll(
    paginationDto: PaginationDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<FindAllPostsResponseDto> {
    const { limit = 50, offset = 0 } = paginationDto;
    const { count, items } = await this.prismaService.findAll(
      this.prismaService.post,
      {
        select: {
          ...this.selectPostFields,

          PostLikes: {
            where: { userId: tokenPayload.sub },
          },
        },

        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      },
    );

    return {
      count,
      items: items.map(({ _count, PostLikes, ...post }) => ({
        ...post,
        commentsCount: _count.comments,
        likes: _count.PostLikes,
        liked: PostLikes.length ? true : false,
      })),
    };
  }

  async findOne(id: string, tokenPayload: TokenPayloadDto) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      select: {
        ...this.selectPostFields,
        PostLikes: {
          where: { userId: tokenPayload.sub },
        },
        comments: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const { _count, PostLikes, comments, ...rest } = post;
    return {
      ...rest,
      likes: _count.PostLikes,
      commentsCount: _count.comments,
      comments,
      liked: !!PostLikes.length,
    };
  }

  async remove(id: string, tokenPayload: TokenPayloadDto): Promise<void> {
    const post = await this.findOne(id, tokenPayload);
    this.permissionService.verifyUserOwnership(
      post.user.username,
      tokenPayload.username,
    );
    if (post.images.length) {
      await this.cloudinaryService.deletePostImages(
        post.images.map((url) => url.url),
      );
    }

    await this.prismaService.post.delete({ where: { id } });
    return;
  }

  async like(postId: string, tokenPayload: TokenPayloadDto) {
    const post = await this.findOne(postId, tokenPayload);
    if (post.liked) {
      throw new BadRequestException('Post already liked');
    }
    await this.prismaService.postLikes.create({
      data: {
        postId,
        userId: tokenPayload.sub,
      },
    });
  }
  async unlike(postId: string, tokenPayload: TokenPayloadDto) {
    const post = await this.findOne(postId, tokenPayload);
    if (!post.liked) {
      throw new BadRequestException('Post not liked');
    }
    await this.prismaService.postLikes.delete({
      where: {
        postId_userId: {
          postId,
          userId: tokenPayload.sub,
        },
      },
    });
  }
}
