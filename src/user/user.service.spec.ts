import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  selectUserFieldsMock,
  userPrismaService,
} from '../prisma/mock/prisma.service.mock';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  cloudinaryServiceMock,
  generateFileMock,
  generatedProfilePictureMock,
} from '../cloudinary/mocks';
import { PermissionService } from '../permission/permission.service';
import { permissionServiceMock } from '../permission/mock/permission.service.mock';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import {
  jwtServiceMock,
  generateTokenPayloadDtoMock,
  hashingServiceMock,
} from '../auth/mocks';
import { TokenPayloadDto } from '../auth/dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CreateUserDto, FindAllUsersResponseDto, UpdateUserDto } from './dto';
import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './mocks';

describe('<UserService />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;
  let jwtService: JwtService;
  let permissionService: PermissionService;

  //mocks
  let createUserDto: CreateUserDto;
  let file: Express.Multer.File;
  let user: User;
  let passwordHash: string;
  let findAllResponse: FindAllUsersResponseDto;
  let updateUserDto: UpdateUserDto;
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
          useValue: permissionServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jwtService = module.get<JwtService>(JwtService);
    permissionService = module.get<PermissionService>(PermissionService);

    // mocks
    createUserDto = generateCreateUserDtoMock(true);
    file = generateFileMock();
    user = generateUserMock();
    username = user.username;
    passwordHash = 'HASH_PASSWORD';
    findAllResponse = generateFindAllUsersResponseDtoMock();
    updateUserDto = {
      name: 'new name',
      password: 'new_password',
      bio: 'new bio',
    };
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
    expect(jwtService).toBeDefined();
    expect(permissionService).toBeDefined();
  });

  describe('<Create />', () => {
    it('should create a user successfully', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(cloudinaryService, 'uploadProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user as any);

      const result = await service.create(createUserDto, file);

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(file);
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: passwordHash,
          profileImg: generatedProfilePictureMock,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });

    it('should create a user successfully without profile picture', async () => {
      file = null;

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user as any);

      const result = await service.create(createUserDto, file);

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(cloudinaryService.uploadProfilePicture).not.toHaveBeenCalled();
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: passwordHash,
          profileImg: file,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });

    it('should throw an ConflictException if user already exists', async () => {
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue({} as any);

      await expect(service.create({} as any, null)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('<FindOne />', () => {
    it('should return a user successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      const result = await service.findOne(username);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(result);
      expect(result).toMatchSnapshot();
    });

    it('should throw an NotFoundException', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(username)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('<FindAll />', () => {
    it('should search for a list of users ', async () => {
      const query = {
        search: 'jD',
        limit: 1,
        offset: 0,
      };

      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(findAllResponse.items as any);
      jest
        .spyOn(prismaService.user, 'count')
        .mockResolvedValue(findAllResponse.count);

      const result = await service.findAll(query);

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(prismaService.user.count).toHaveBeenCalled();
      expect(result.count).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result).toEqual(findAllResponse);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<Update />', () => {
    it('should update a user successfully without profile picture', async () => {
      user.profileImg = null;
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(cloudinaryService, 'uploadProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...updateUserDto,
        ...user,
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
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { username },
        data: {
          ...updateUserDto,
          password: passwordHash,
          profileImg: generatedProfilePictureMock,
        },
        select: selectUserFieldsMock,
      });
      expect(result).toEqual({
        ...updateUserDto,
        ...user,
      });

      expect(result).toMatchSnapshot();
    });
    it('should update a user successfully with profile picture', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(cloudinaryService, 'updateProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...updateUserDto,
        ...user,
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
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { username },
        data: {
          ...updateUserDto,
          password: passwordHash,
          profileImg: generatedProfilePictureMock,
        },
        select: selectUserFieldsMock,
      });
      expect(result).toEqual({
        ...updateUserDto,
        ...user,
      });

      expect(result).toMatchSnapshot();
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.update(username, updateUserDto, file, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if email is already in use', async () => {
      updateUserDto.email = 'johndoe@example.com';

      const conflictingUserMock = {
        id: 2,
        username: 'otherUser',
        email: 'newemail@example.com',
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(conflictingUserMock as any);

      await expect(
        service.update(username, updateUserDto, undefined, tokenPayload),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw an error if a user is trying to update other user', async () => {
      user.id = 'other-id-4';
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(user as any);
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

  describe('<DesactivateUser />', () => {
    it('should delete a user successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ active: false } as any);
      jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
      const result = await service.desactivateUser(username, tokenPayload);
      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { username },
        data: { active: false },
      });
      expect(result).toEqual({ message: 'User desactivated successfully' });
      expect(result).toMatchSnapshot();
    });

    it('should throw a NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(
        service.desactivateUser(username, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw a BadRequestException if user is already deleted', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        active: false,
      } as any);
      await expect(
        service.desactivateUser(username, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an error if a user is trying to remove other user', async () => {
      user.id = 'other-id-4';
      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      jest
        .spyOn(permissionService, 'verifyUserOwnership')
        .mockImplementation(() => {
          throw new ForbiddenException();
        });
      await expect(
        service.desactivateUser(username, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('<RemoveProfilePicture />', () => {
    it('should not remove profile picture if user does not have one', async () => {
      user.profileImg = null;
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
      const result = await service.removeProfilePicture(username, tokenPayload);

      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should remove profile picture successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, profileImg: null } as any);
      jest
        .spyOn(cloudinaryService, 'deleteProfilePicture')
        .mockResolvedValue(null);

      const result = await service.removeProfilePicture(username, tokenPayload);

      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(cloudinaryService.deleteProfilePicture).toHaveBeenCalledWith(
        user.profileImg,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { profileImg: null },
        select: selectUserFieldsMock,
      });
      expect(result).toEqual({ ...user, profileImg: null });
      expect(result).toMatchSnapshot();
    });
    it('should throw an BadRequestException on cloudinary error', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest.spyOn(permissionService, 'verifyUserOwnership').mockImplementation();
      jest
        .spyOn(cloudinaryService, 'deleteProfilePicture')
        .mockRejectedValue(
          new BadRequestException('Error deleting profile picture.'),
        );

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
});
