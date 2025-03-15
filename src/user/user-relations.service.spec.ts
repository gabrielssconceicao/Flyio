import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { userPrismaService } from '../prisma/mock/prisma.service.mock';
import { generateTokenPayloadDtoMock, jwtServiceMock } from '../auth/mocks';
import { UserRelationsService } from './user-relations.service';
import { generateFindAllPostsDtoMock } from '../post/mock';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllPostsResponseDto } from '../post/dto';
import { generateUserMock } from './mocks';
import { User } from './entities/user.entity';

describe('<UserRelationsService />', () => {
  let service: UserRelationsService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  let user: User;
  let username: string;
  let paginationDto: PaginationDto;
  let findAllPostsDto: FindAllPostsResponseDto;
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

    username = 'username';

    user = generateUserMock();

    paginationDto = { limit: 10, offset: 0 };
    findAllPostsDto = generateFindAllPostsDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('<GetAllPostsByUsername />', () => {
    it('should return an array of posts of a user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);
      jest.spyOn(prismaService, 'findAll').mockResolvedValue({
        count: findAllPostsDto.count,
        items: findAllPostsDto.items.map((item) => ({
          ...item,
          _count: { PostLikes: 0 },
          PostLikes: [],
        })),
      } as any);

      const result = await service.getAllPostsByUsername(
        username,
        paginationDto,
        generateTokenPayloadDtoMock(),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.findAll).toHaveBeenCalled();
      expect(result).toEqual(findAllPostsDto);
      expect(result).toMatchSnapshot();
    });

    it('should throw an NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getAllPostsByUsername(
          username,
          {},
          generateTokenPayloadDtoMock(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('<GetAllLikedPostsByUsername />', () => {
    it('should return an array of posts if user is found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService, 'findAll').mockResolvedValue({
        count: findAllPostsDto.count,
        items: findAllPostsDto.items.map((item) => ({
          ...item,
          _count: { PostLikes: 1 },
        })),
      } as any);
      findAllPostsDto.items[0] = {
        ...findAllPostsDto.items[0],
        liked: true,
        likes: 1,
      };
      const result = await service.getAllLikedPostsByUsername(
        username,
        paginationDto,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.findAll).toHaveBeenCalled();
      expect(result).toEqual(findAllPostsDto);
      expect(result).toMatchSnapshot();
    });

    it('should throw an NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getAllLikedPostsByUsername(username, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
