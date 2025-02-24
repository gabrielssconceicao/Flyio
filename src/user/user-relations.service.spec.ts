import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { userPrismaService } from '../prisma/mock/prisma.service.mock';
import { jwtServiceMock } from '../auth/mocks';
import { UserRelationsService } from './user-relations.service';

describe('<UserRelationsService />', () => {
  let service: UserRelationsService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRelationsService,
        {
          provide: PrismaService,
          useValue: { ...userPrismaService, findAll: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserRelationsService>(UserRelationsService);

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

  describe('<Reactivate />', () => {
    it('should reactivate a user successfully', async () => {
      const reactivateUserDto = {
        token: 'token',
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1 });
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({} as any);

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

  describe('<GetAllPostsByUsername />', () => {
    it('should return an array of posts if user is found', async () => {
      const username = 'username';
      const paginationDto = { limit: 10, offset: 0 };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({} as any);
      jest.spyOn(prismaService, 'findAll').mockResolvedValue({
        count: 0,
        items: [],
      } as any);

      const result = await service.getAllPostsByUsername(
        username,
        paginationDto,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        count: 0,
        items: [],
      });
      expect(result).toMatchSnapshot();
    });

    it('should throw an NotFoundException if user is not found', async () => {
      const username = 'username';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getAllPostsByUsername(username, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
