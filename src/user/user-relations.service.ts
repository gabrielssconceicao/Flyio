import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ReactivateUserDto } from './dto';

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
}
