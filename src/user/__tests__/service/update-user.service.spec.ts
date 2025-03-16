import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { generateUserMock } from '../../mocks';
import { UserService } from '../../user.service';
import { UpdateUserDto } from '../../dto';
import { User } from '../../entities/user.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import {
  generateTokenPayloadDtoMock,
  hashingServiceMock,
  jwtServiceMock,
} from 'src/auth/mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  cloudinaryServiceMock,
  generatedProfilePictureMock,
  generateFileMock,
} from 'src/cloudinary/mocks';
import { PermissionService } from 'src/permission/permission.service';
import { TokenPayloadDto } from 'src/auth/dto';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('<UserService - (update) />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;
  let permissionService: PermissionService;

  let user: User;
  let passwordHash: string;
  let updateUserDto: UpdateUserDto;
  let username: string;
  let file: Express.Multer.File;
  let tokenPayload: TokenPayloadDto;
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
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
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
          useValue: {
            verifyUserOwnership: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    permissionService = module.get<PermissionService>(PermissionService);

    user = generateUserMock();
    passwordHash = 'hashedPassword';
    updateUserDto = {
      name: 'new name',
      password: 'new_password',
      bio: 'new bio',
    };
    username = user.username;
    file = generateFileMock();
    tokenPayload = generateTokenPayloadDtoMock();
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

  it('should update a user successfully without profile picture', async () => {
    user.profileImg = null;
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      ...user,
      _count: { following: 0, followers: 0 },
    } as any);
    jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
    jest
      .spyOn(cloudinaryService, 'uploadProfilePicture')
      .mockResolvedValue(generatedProfilePictureMock);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue({
      ...updateUserDto,
      ...user,
      _count: { following: 0, followers: 0 },
    } as any);

    const result = await service.update(
      username,
      updateUserDto,
      file,
      tokenPayload,
    );
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { username },
    });
    expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
    expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(file);
    expect(prismaService.user.update).toHaveBeenCalled();
    expect(result).toEqual({
      ...updateUserDto,
      ...user,
    });

    expect(result).toMatchSnapshot();
  });

  it('should update a user successfully with profile picture', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      ...user,
      _count: { following: 0, followers: 0 },
    } as any);
    jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
    jest
      .spyOn(cloudinaryService, 'updateProfilePicture')
      .mockResolvedValue(generatedProfilePictureMock);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue({
      ...updateUserDto,
      ...user,
      _count: { following: 0, followers: 0 },
    } as any);

    const result = await service.update(
      username,
      updateUserDto,
      file,
      tokenPayload,
    );
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { username },
    });
    expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
    expect(cloudinaryService.updateProfilePicture).toHaveBeenCalledWith(
      file,
      user.profileImg,
    );
    expect(prismaService.user.update).toHaveBeenCalled();
    expect(result).toEqual({
      ...updateUserDto,
      ...user,
    });

    expect(result).toMatchSnapshot();
  });

  it('should throw an NotFoundException if user not found', async () => {
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockRejectedValue(new NotFoundException());

    await expect(
      service.update(username, updateUserDto, file, tokenPayload),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw an ConflictException if email is already in use', async () => {
    updateUserDto.email = 'johndoe@example.com';

    const conflictingUserMock = {
      id: 2,
      username: 'otherUser',
      email: 'newemail@example.com',
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);

    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(conflictingUserMock as any);

    await expect(
      service.update(username, updateUserDto, undefined, tokenPayload),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw an ForbiddenException if a user is trying to update other user', async () => {
    user.id = 'other-id-4';
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);
    jest
      .spyOn(permissionService, 'verifyUserOwnership')
      .mockImplementation(() => {
        throw new ForbiddenException();
      });
    await expect(
      service.update(username, updateUserDto, undefined, tokenPayload),
    ).rejects.toThrow(ForbiddenException);
  });
});
