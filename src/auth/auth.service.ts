import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashingServiceProtocol } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}
  private throwUnauthorizedError() {
    throw new UnauthorizedException('User or password invalid');
  }
  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: loginDto.login }, { email: loginDto.login }],
      },
    });
    if (!user) {
      throw new this.throwUnauthorizedError();
    }
    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.throwUnauthorizedError();
    }
    console.log(user);
    return loginDto;
  }
}
