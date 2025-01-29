import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { userPrismaService } from '../prisma/mock/prisma.service.mock';
import { hashingServiceMock } from './mocks/hashing.service.mock';
import { jwtConfigurationMock } from './mocks/jwt.configuration.mock';
import { jwtServiceMock } from './mocks/jwt.service.mock';
import { HashingServiceProtocol } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { generateLoginDtoMock } from './mocks/login.dto.mock';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
describe('<AuthService />', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let hashingService: HashingServiceProtocol;
  let jwtService: JwtService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;
  let loginDto: LoginDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: userPrismaService,
        },
        {
          provide: HashingServiceProtocol,
          useValue: hashingServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfigurationMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    jwtService = module.get<JwtService>(JwtService);
    jwtConfiguration = module.get<ConfigType<typeof jwtConfig>>(jwtConfig.KEY);
    loginDto = generateLoginDtoMock();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(jwtConfiguration).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('<Login />', () => {
    it('should realize login', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        id: 'id-1',
        username: 'jDoe',
        password: 'hashed-password',
        active: true,
      } as any);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(hashingService.compare).toHaveBeenCalledWith(
        loginDto.password,
        'hashed-password',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(result).toMatchSnapshot();
    });

    it('should thow an UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should thow an UnauthorizedException if password are invalid', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({} as any);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(hashingService.compare).toHaveBeenCalled();
    });

    it('should thow an ForbiddenException if user is not active', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({
        id: 'id-1',
        password: 'hashed-password',
        active: false,
      } as any);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);

      jest.spyOn(jwtService, 'sign').mockReturnValue('access-token');

      await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(hashingService.compare).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).not.toHaveBeenCalledWith(
        { id: 'id-1' },
        {
          expiresIn: jwtConfigurationMock.accessTokenExpiresIn,
        },
      );
    });
  });

  describe('<RefreshToken />', () => {
    it('should generate a new access token with a valid refresh token', async () => {
      const payload = { sub: 'id-1', username: 'jDoe' };
      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access-token');

      const result = await service.refreshToken({
        refreshToken: 'refresh-token',
      });
      expect(jwtService.verify).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        accessToken: 'access-token',
      });
      expect(result).toMatchSnapshot();
    });
    it('should throw an ForbiddenException if refresh token is expitred', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });

      await expect(
        service.refreshToken({ refreshToken: 'refresh-token' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
