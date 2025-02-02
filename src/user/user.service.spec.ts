import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  selectUserFieldsMock,
  userPrismaService,
} from '../prisma/mock/prisma.service.mock';
import { hashingServiceMock } from '../auth/mocks/hashing.service.mock';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './mocks/user.mock';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from '../cloudinary/mock/cloudinary.service.mock';
import {
  generatedProfilePictureMock,
  generateFileMock,
} from '../cloudinary/mock/file.mock';
import { jwtServiceMock } from '../auth/mocks/jwt.service.mock';
import { JwtService } from '@nestjs/jwt';

describe('<UserService />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;
  let jwtService: JwtService;
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    jwtService = module.get<JwtService>(JwtService);
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
  });

  describe('<Create />', () => {
    it('should create a user successfully', async () => {
      const passwordHash = 'HASH_PASSWORD';
      const createUserDto = generateCreateUserDtoMock(true);
      const newUser = generateUserMock();
      const imageFile = generateFileMock();

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(cloudinaryService, 'uploadProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(newUser as any);

      const result = await service.create(createUserDto, imageFile);

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(
        imageFile,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: passwordHash,
          profileImg: generatedProfilePictureMock,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(newUser);
      expect(result).toMatchSnapshot();
    });

    it('should create a user successfully without profile picture', async () => {
      const passwordHash = 'HASH_PASSWORD';
      const createUserDto = generateCreateUserDtoMock(true);
      const newUser = generateUserMock();
      const imageFile = null;

      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(newUser as any);

      const result = await service.create(createUserDto, imageFile);

      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(cloudinaryService.uploadProfilePicture).not.toHaveBeenCalled();
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: passwordHash,
          profileImg: imageFile,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(newUser);
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
      const username = generateCreateUserDtoMock().username;
      const user = generateUserMock();

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

      await expect(service.findOne('jD')).rejects.toThrow(NotFoundException);
    });
  });

  describe('<Update />', () => {
    it('should update a user successfully without profile picture', async () => {
      const updateUserDto = {
        name: 'new name',
        password: 'new_password',
        bio: 'new bio',
      };
      const username = generateCreateUserDtoMock().username;

      const user = generateUserMock();
      user.profileImg = null;
      const imageFile = generateFileMock();
      const passwordHash = 'HASH_PASSWORD';
      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(cloudinaryService, 'uploadProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...updateUserDto,
        ...user,
      } as any);

      const result = await service.update(username, updateUserDto, imageFile);
      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(
        imageFile,
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
    it('should update a user successfully with profile picture', async () => {
      const updateUserDto = {
        name: 'new name',
        password: 'new_password',
        bio: 'new bio',
      };
      const username = generateCreateUserDtoMock().username;

      const user = generateUserMock();
      const imageFile = generateFileMock();
      const passwordHash = 'HASH_PASSWORD';
      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(cloudinaryService, 'updateProfilePicture')
        .mockResolvedValue(generatedProfilePictureMock);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...updateUserDto,
        ...user,
      } as any);

      const result = await service.update(username, updateUserDto, imageFile);
      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(cloudinaryService.updateProfilePicture).toHaveBeenCalledWith(
        imageFile,
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
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(
        service.update('jDoe', {} as any, undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if email is already in use', async () => {
      const updateUserDto = {
        email: 'newemail@example.com',
      };

      const existingUserMock = {
        id: 1,
        username: 'jDoe2',
        email: 'johndoe@example.com',
      };

      const conflictingUserMock = {
        id: 2,
        username: 'otherUser',
        email: 'newemail@example.com',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingUserMock as any);

      jest
        .spyOn(prismaService.user, 'findFirst')
        .mockResolvedValue(conflictingUserMock as any);

      await expect(
        service.update('jDoe2', updateUserDto, undefined),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw an error if a user is trying to update other user', async () => {});
  });

  describe('<Remove />', () => {
    it('should delete a user successfully', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ active: true } as any);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ active: false } as any);

      const id = generateUserMock().id;

      const result = await service.remove(id);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: id },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: id },
        data: { active: false },
      });
      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(result).toMatchSnapshot();
    });

    it('should throw a NotFoundException if user not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ active: false } as any);
      await expect(service.remove('jD')).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if a user is trying to remove other user', async () => {});
  });

  describe('<FindAll />', () => {
    it('should search for a list of users ', async () => {
      const query = {
        search: 'jD',
        limit: 1,
        offset: 0,
      };
      const findAllResponse = generateFindAllUsersResponseDtoMock();
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(findAllResponse.users as any);
      jest
        .spyOn(prismaService.user, 'count')
        .mockResolvedValue(findAllResponse.count);

      const result = await service.findAll(query);

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(prismaService.user.count).toHaveBeenCalled();
      expect(result.count).toBe(1);
      expect(result.users.length).toBe(1);
      expect(result).toEqual(findAllResponse);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<RemoveProfilePicture />', () => {
    it('should not remove profile picture if user does not have one', async () => {
      const username = generateCreateUserDtoMock().username;
      const user = { ...generateUserMock(), profileImg: null };
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      const result = await service.removeProfilePicture(username);

      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should remove profile picture successfully', async () => {
      const username = generateCreateUserDtoMock().username;
      const user = generateUserMock();

      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue({ ...user, profileImg: null } as any);
      jest
        .spyOn(cloudinaryService, 'deleteProfilePicture')
        .mockResolvedValue(null);

      const result = await service.removeProfilePicture(username);

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
      const username = generateCreateUserDtoMock().username;
      const user = generateUserMock();

      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      jest
        .spyOn(cloudinaryService, 'deleteProfilePicture')
        .mockRejectedValue(
          new BadRequestException('Error deleting profile picture.'),
        );

      await expect(service.removeProfilePicture(username)).rejects.toThrow(
        BadRequestException,
      );

      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(cloudinaryService.deleteProfilePicture).toHaveBeenCalledWith(
        user.profileImg,
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
    it('should throw an error if a user is trying to delete other user profile picture', async () => {});
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
