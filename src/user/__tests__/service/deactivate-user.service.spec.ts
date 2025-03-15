import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { generateUserMock } from '../../mocks';
import { UserService } from '../../user.service';
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

describe('<UserService - (deactivate) />', () => {
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

  it('should deactivate a user successfully', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
    jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue({ active: false } as any);
    jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
    const result = await service.deactivate(username, tokenPayload);
    expect(service.findOne).toHaveBeenCalledWith(username);
    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { username },
      data: { active: false },
    });
    expect(result).toEqual({ message: 'User deactivated successfully' });
    expect(result).toMatchSnapshot();
  });

  it('should throw a NotFoundException if user not found', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
    await expect(service.deactivate(username, tokenPayload)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw a BadRequestException if user is already deleted', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      ...user,
      active: false,
    } as any);
    await expect(service.deactivate(username, tokenPayload)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw an error if a user is trying to remove other user', async () => {
    user.id = 'other-id-4';
    jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
    jest
      .spyOn(permissionService, 'verifyUserOwnership')
      .mockImplementation(() => {
        throw new ForbiddenException();
      });
    await expect(service.deactivate(username, tokenPayload)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
