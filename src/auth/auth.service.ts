import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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
    const accessToken = await this.createToken(user);
    return { accessToken };
  }

  private async createToken(user): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.jwtConfiguration.jwtTtl,
      secret: this.jwtConfiguration.secret,
    });
  }
}
