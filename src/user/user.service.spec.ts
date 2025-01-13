import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  selectUserFieldsMock,
  userPrismaService,
} from '../mocks/prisma.service.mock';
import { hashingServiceMock } from '../mocks/hashing.service.mock';
import { createUserDtoMock } from '../mocks/user.mock';
import { User } from './entities/user.entity';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('<UserService />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashingServiceProtocol,
          useValue: hashingServiceMock,
        },
        {
          provide: PrismaService,
          useValue: userPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('<Create />', () => {
    it('should create a user successfully', async () => {
      const passwordHash = 'HASH_PASSWORD';
      const newUser: User = {
        name: createUserDtoMock.name,
        username: createUserDtoMock.username,
        email: createUserDtoMock.email,
        profileImg: createUserDtoMock.profileImg,
        bio: createUserDtoMock.bio,
      };
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(newUser as any);

      const result = await service.create(createUserDtoMock);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createUserDtoMock.password,
      );

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDtoMock,
          password: passwordHash,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(newUser);
    });

    it('should throw an ConflictException if user already exists', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({} as any);

      await expect(service.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });
    it('should throw an InternalServerErrorException ', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prismaService.user, 'create')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
