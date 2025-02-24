import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ReactivateUserDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllUsersPostsResponseDto } from './dto/find-all-user-posts.dto';

@Injectable()
export class UserRelationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async reactivate(reactivateUserDto: ReactivateUserDto) {
    try {
      const { sub } = this.jwtService.verify(reactivateUserDto.token);
      await this.prismaService.user.update({
        where: { id: sub },
        data: { active: true },
      });
      return { message: 'Account reactivated successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getAllPostsByUsername(
    username: string,
    paginationDto: PaginationDto,
  ): Promise<FindAllUsersPostsResponseDto> {
    const { limit = 50, offset = 0 } = paginationDto;

    if (
      !(await this.prismaService.user.findUnique({
        where: { username },
      }))
    ) {
      throw new NotFoundException('User not found');
    }

    const { count, items } = await this.prismaService.findAll(
      this.prismaService.post,
      {
        where: { user: { username } },
        select: {
          id: true,
          content: true,
          createdAt: true,
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      },
    );

    return { count, items: items as any };
  }
}
