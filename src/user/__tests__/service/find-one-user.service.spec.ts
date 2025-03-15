import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { generateUserMock } from '../../mocks';
import { UserService } from '../../user.service';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { hashingServiceMock, jwtServiceMock } from 'src/auth/mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { userPrismaService } from 'src/prisma/mock/prisma.service.mock';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { PermissionService } from 'src/permission/permission.service';

describe('<UserService - (findOne) />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  let user: User;
  let username: string;
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
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PermissionService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);

    user = generateUserMock();
    username = user.username;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cloudinaryService).toBeDefined();
  });

  it('should return a user successfully', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      ...user,
      _count: { followers: 0, following: 0 },
    } as any);

    const result = await service.findOne(username);

    expect(prismaService.user.findUnique).toHaveBeenCalled();

    expect(result).toEqual(result);
    expect(result).toMatchSnapshot();
  });

  it('should throw an NotFoundException', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(service.findOne(username)).rejects.toThrow(NotFoundException);
  });
});
