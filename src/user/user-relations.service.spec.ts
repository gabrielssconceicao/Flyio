import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { generateTokenPayloadDtoMock } from '../auth/mocks';
import { UserRelationsService } from './user-relations.service';
import { generateFindAllPostsDtoMock } from '../post/mock';
import { PaginationDto } from '../common/dto/pagination.dto';
import { generateUserMock, generateFindAllUsersResponseDtoMock } from './mocks';

describe('<UserRelationsService />', () => {
  let service: UserRelationsService;
  let prismaService: PrismaService;

  let user: ReturnType<typeof generateUserMock>;
  let username: string;
  let findAllUsersResponseDto: ReturnType<
    typeof generateFindAllUsersResponseDtoMock
  >;
  let paginationDto: PaginationDto;
  let findAllPostsDto: ReturnType<typeof generateFindAllPostsDtoMock>;

  let tokenPayload: ReturnType<typeof generateTokenPayloadDtoMock>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRelationsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            follower: {
              findFirst: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserRelationsService>(UserRelationsService);

    prismaService = module.get<PrismaService>(PrismaService);

    username = 'jDoe453';
    user = generateUserMock();
    findAllUsersResponseDto = generateFindAllUsersResponseDtoMock();
    paginationDto = { limit: 10, offset: 0 };
    findAllPostsDto = generateFindAllPostsDtoMock();

    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
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
        tokenPayload,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.findAll).toHaveBeenCalled();
      expect(result).toEqual(findAllPostsDto);
      expect(result).toMatchSnapshot();
    });

    it('should throw an NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getAllPostsByUsername(username, {}, tokenPayload),
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

  describe('<FollowUser />', () => {
    it('should follow a user', async () => {
      user.id = 'id-jonny';
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await service.followUser(username, tokenPayload);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.follower.findFirst).toHaveBeenCalled();
      expect(prismaService.follower.create).toHaveBeenCalled();
    });

    it('should throw an NotFoundException if user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new NotFoundException());

      await expect(service.followUser(username, tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an BadRequestException if user follows itself', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      await expect(
        service.followUser(user.username, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an BadRequestException if user is already followed', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({} as any);

      await expect(service.followUser(username, tokenPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('<UnfollowUser />', () => {
    it('should unfollow a user', async () => {
      user.id = 'id-jonny';
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);
      jest
        .spyOn(prismaService.follower, 'findFirst')
        .mockResolvedValue({ userId: 'id-1', followingId: 'id-donny' } as any);
      jest.spyOn(prismaService.follower, 'delete').mockResolvedValue({} as any);

      await service.unfollowUser(user.username, tokenPayload);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.follower.findFirst).toHaveBeenCalled();
      expect(prismaService.follower.delete).toHaveBeenCalled();
    });

    it('should throw an NotFoundException if user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.unfollowUser(username, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an BadRequestException if user unfollows itself', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      await expect(
        service.unfollowUser(user.username, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an BadRequestException if user is already unfollowed', async () => {
      user.id = 'id-jonny';
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

      await expect(
        service.unfollowUser(username, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('<getAllFollowingsByUser />', () => {
    it('should return an array of followings of a user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService, 'findAll').mockResolvedValue({
        count: findAllUsersResponseDto.count,
        items: [{ following: findAllUsersResponseDto.items[0] }],
      } as any);

      const result = await service.getAllFollowingsByUser(username);

      expect(result).toEqual(findAllUsersResponseDto);
      expect(result.count).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<GetAllFollowersByUser />', () => {
    it('should return an array of followers of a user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest.spyOn(prismaService, 'findAll').mockResolvedValue({
        count: findAllUsersResponseDto.count,
        items: [{ user: findAllUsersResponseDto.items[0] }],
      } as any);

      const result = await service.getAllFollowersByUser(
        username,
        paginationDto,
      );

      expect(result).toEqual(findAllUsersResponseDto);
      expect(result.count).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result).toMatchSnapshot();
    });
  });
});
