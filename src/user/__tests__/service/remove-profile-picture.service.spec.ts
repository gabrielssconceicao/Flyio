import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { generateUserMock } from '../../mocks';
import { UserService } from '../../user.service';
import { User } from '../../entities/user.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import {
  generateTokenPayloadDtoMock,
  hashingServiceMock,
  jwtServiceMock,
} from 'src/auth/mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { PermissionService } from 'src/permission/permission.service';
import { TokenPayloadDto } from 'src/auth/dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('<UserService - (removeProfilePicture) />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;
  let permissionService: PermissionService;

  let user: User;
  let username: string;
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

    username = user.username;

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

  it('should not remove profile picture if user does not have one', async () => {
    user.profileImg = null;
    jest.spyOn(service, 'findOne').mockResolvedValue(user);
    jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
    const result = await service.removeProfilePicture(username, tokenPayload);

    expect(service.findOne).toHaveBeenCalledWith(username);
    expect(cloudinaryService.deleteProfilePicture).not.toHaveBeenCalled();
    expect(prismaService.user.update).not.toHaveBeenCalled();
    expect(result).toEqual(user);
    expect(result).toMatchSnapshot();
  });

  it('should remove profile picture successfully', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(user);
    jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
    jest.spyOn(prismaService.user, 'update').mockResolvedValue({
      ...user,
      profileImg: null,
      _count: { followers: 0, following: 0 },
    } as any);

    const result = await service.removeProfilePicture(username, tokenPayload);

    expect(service.findOne).toHaveBeenCalledWith(username);
    expect(cloudinaryService.deleteProfilePicture).toHaveBeenCalledWith(
      user.profileImg,
    );
    expect(prismaService.user.update).toHaveBeenCalled();
    expect(result).toEqual({ ...user, profileImg: null });
    expect(result).toMatchSnapshot();
  });

  it('should throw an BadRequestException on cloudinary error', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(user);
    jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
    jest
      .spyOn(cloudinaryService, 'deleteProfilePicture')
      .mockRejectedValue(new BadRequestException());

    await expect(
      service.removeProfilePicture(username, tokenPayload),
    ).rejects.toThrow(BadRequestException);

    expect(service.findOne).toHaveBeenCalledWith(username);
    expect(cloudinaryService.deleteProfilePicture).toHaveBeenCalledWith(
      user.profileImg,
    );
    expect(prismaService.user.update).not.toHaveBeenCalled();
  });

  it('should throw an error if a user is trying to delete other user profile picture', async () => {
    user.id = 'other-id-4';
    jest.spyOn(service, 'findOne').mockResolvedValue(user);
    jest
      .spyOn(permissionService, 'verifyUserOwnership')
      .mockImplementation(() => {
        throw new ForbiddenException();
      });
    await expect(
      service.removeProfilePicture(username, tokenPayload),
    ).rejects.toThrow(ForbiddenException);
  });
});
