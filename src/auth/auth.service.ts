import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
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
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: loginDto.login }, { email: loginDto.login }],
      },
    });
    if (!user) {
      this.throwUnauthorizedError();
    }
    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      this.throwUnauthorizedError();
    }
    if (!user.active) {
      // generate a token to active the user
      const reactiveToken = this.jwtService.sign(
        {
          sub: user.id,
        },
        { expiresIn: this.jwtConfiguration.accessTokenExpiresIn },
      );
      throw new ForbiddenException({
        message: 'User not active',
        reactiveToken,
      });
    }
    const payload = { username: user.username, sub: user.id };

    return this.createToken(payload);
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<Pick<LoginResponseDto, 'accessToken'>> {
    try {
      const { sub, username } = this.jwtService.verify(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );
      const { accessToken } = await this.createToken({ sub, username });
      return { accessToken };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Token expired');
      }
    }
  }

  private async createToken(payload: { username: string; sub: string }) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn: this.jwtConfiguration.accessTokenExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
      expiresIn: this.jwtConfiguration.refreshTokenExpiresIn,
    });
    return { accessToken, refreshToken };
  }
}
