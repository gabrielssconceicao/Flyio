import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { generateCreateUserDtoMock, generateUserMock } from '../../mocks';
import { UserService } from '../../user.service';
import { CreateUserDto } from '../../dto';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { hashingServiceMock, jwtServiceMock } from 'src/auth/mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  cloudinaryServiceMock,
  generatedProfilePictureMock,
  generateFileMock,
} from 'src/cloudinary/mocks';
import { PermissionService } from 'src/permission/permission.service';

describe('<UserService - (create) />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  let hashedPassword: string;
  let user: User;
  let createUserDto: CreateUserDto;
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
          useValue: {
            user: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
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

    hashedPassword = 'hashedPassword';
    user = generateUserMock();
    createUserDto = generateCreateUserDtoMock();
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

  it('should create a user without profile picture successfully', async () => {
    user.profileImg = null;
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(prismaService.user, 'create').mockResolvedValue({
      ...user,
      _count: { followers: 0, following: 0 },
    } as any);
    const result = await service.create(createUserDto, null);
    expect(result).toEqual(user);
    expect(result.profileImg).toBeNull();
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(cloudinaryService.uploadProfilePicture).not.toHaveBeenCalled();
    expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
    expect(prismaService.user.create).toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should create a user with profile picture successfully', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(cloudinaryService, 'uploadProfilePicture')
      .mockResolvedValue(generatedProfilePictureMock);
    jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(prismaService.user, 'create').mockResolvedValue({
      ...user,
      _count: { followers: 0, following: 0 },
    } as any);

    const file = generateFileMock();
    const result = await service.create(createUserDto, file);
    expect(result).toEqual(user);
    expect(prismaService.user.findFirst).toHaveBeenCalled();
    expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(file);
    expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
    expect(prismaService.user.create).toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('should throw ConflictException if user already exists', async () => {
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({} as any);

    await expect(service.create(createUserDto, null)).rejects.toThrow(
      ConflictException,
    );
  });
});
