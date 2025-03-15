import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtServiceMock } from 'src/auth/mocks';
import { generateUserMock } from '../../mocks';
import { ReactivateUserService } from '../../reactivate-user.service';
describe('<ReactivateUserService />', () => {
  let service: ReactivateUserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactivateUserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<ReactivateUserService>(ReactivateUserService);

    prismaService = module.get<PrismaService>(PrismaService);

    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should reactivate a user successfully', async () => {
    const reactivateUserDto = {
      token: 'token',
    };
    jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1 });
    jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue(generateUserMock() as any);

    const result = await service.reactivate(reactivateUserDto);
    expect(jwtService.verify).toHaveBeenCalledWith(reactivateUserDto.token);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: true },
    });
    expect(result).toEqual({ message: 'Account reactivated successfully' });
    expect(result).toMatchSnapshot();
  });

  it('should throw an UnauthorizedException if token is invalid', async () => {
    const reactivateUserDto = {
      token: 'token',
    };
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new UnauthorizedException();
    });

    await expect(service.reactivate(reactivateUserDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
