import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllUsersResponseDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllUsersPostsResponseDto } from './dto/find-all-user-posts.dto';
import { FindAllLikedPostsResponseDto } from '../post/dto/find-all-liked-post.dto';
import { TokenPayloadDto } from '../auth/dto';

@Injectable()
export class UserRelationsService {
  constructor(private readonly prismaService: PrismaService) {}

  private selectPostFields = {
    id: true,
    content: true,
    createdAt: true,
    images: {
      select: {
        url: true,
        id: true,
      },
    },
    user: {
      select: {
        username: true,
        profileImg: true,
      },
    },
    _count: {
      select: {
        PostLikes: true,
      },
    },
  };

  async getAllPostsByUsername(
    username: string,
    paginationDto: PaginationDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<FindAllUsersPostsResponseDto> {
    const { limit = 50, offset = 0 } = paginationDto;

    await this.userExists(username);

    const { count, items } = await this.prismaService.findAll(
      this.prismaService.post,
      {
        where: { user: { username } },
        select: {
          ...this.selectPostFields,
          PostLikes: {
            where: { userId: tokenPayload.sub },
            select: { userId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      },
    );

    const mappedPosts = items.map(({ _count, PostLikes, ...post }) => ({
      ...post,
      likes: _count.PostLikes,
      liked: !!PostLikes.length,
    }));

    return { count, items: mappedPosts };
  }

  async getAllLikedPostsByUsername(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<FindAllLikedPostsResponseDto> {
    const { limit = 50, offset = 0 } = paginationDto;
    const user = await this.userExists(username);

    const { count, items } = await this.prismaService.findAll(
      this.prismaService.post,
      {
        where: {
          PostLikes: {
            some: {
              userId: user.id,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        select: this.selectPostFields,
      },
    );

    return {
      count,
      items: items.map(({ _count, ...post }) => {
        return { ...post, likes: _count.PostLikes, liked: true };
      }),
    };
  }

  async followUser(username: string, tokenPayload: TokenPayloadDto) {
    const followingUser = await this.userExists(username);

    if (!followingUser) {
      throw new NotFoundException('User not found');
    }

    if (followingUser.id === tokenPayload.sub) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const follower = await this.prismaService.follower.findFirst({
      where: {
        followingId: followingUser.id,
        userId: tokenPayload.sub,
      },
    });

    if (follower) {
      throw new BadRequestException('User already followed');
    }

    await this.prismaService.follower.create({
      data: {
        followingId: followingUser.id,
        userId: tokenPayload.sub,
      },
    });
  }

  async unfollowUser(username: string, tokenPayload: TokenPayloadDto) {
    const followingUser = await this.userExists(username);

    if (followingUser.id === tokenPayload.sub) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    const follower = await this.prismaService.follower.findFirst({
      where: {
        followingId: followingUser.id,
        userId: tokenPayload.sub,
      },
    });

    if (!follower) {
      throw new BadRequestException('User already unfollowed');
    }

    await this.prismaService.follower.delete({
      where: {
        userId_followingId: {
          followingId: followingUser.id,
          userId: tokenPayload.sub,
        },
      },
    });
  }
  async getAllFollowingsByUser(
    username: string,
  ): Promise<FindAllUsersResponseDto> {
    const user = await this.userExists(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { count, items } = await this.prismaService.findAll(
      this.prismaService.follower,
      {
        where: { userId: user.id },
        select: {
          following: {
            select: {
              username: true,
              name: true,
              profileImg: true,
              id: true,
            },
          },
        },
      },
    );

    return { count, items: items.map((item) => item.following) };
  }
  async getAllFollowersByUser(
    username: string,
  ): Promise<FindAllUsersResponseDto> {
    const user = await this.userExists(username);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { count, items } = await this.prismaService.findAll(
      this.prismaService.follower,
      {
        where: { followingId: user.id },
        select: {
          user: {
            select: {
              username: true,
              name: true,
              profileImg: true,
              id: true,
            },
          },
        },
      },
    );

    return { count, items: items.map((item) => item.user) };
  }

  private async userExists(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
