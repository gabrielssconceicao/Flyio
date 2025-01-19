import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  selectUserFieldsMock,
  userPrismaService,
} from '../mocks/prisma.service.mock';
import { hashingServiceMock } from '../mocks/hashing.service.mock';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './mocks/user.mock';

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
      const newUser = generateUserMock();
      const createUserDto = generateCreateUserDtoMock(true, true);
      jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(newUser as any);

      const result = await service.create(createUserDto);

      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: passwordHash,
        },
        select: selectUserFieldsMock,
      });

      expect(result).toEqual(newUser);
      expect(result).toMatchSnapshot();
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
    it('should update a user successfully', async () => {
      const updateUserDto = {
        name: 'new name',
        password: 'new_password',
        profileImg: 'http://newprofileImg.com',
        bio: 'new bio',
      };
      const username = generateCreateUserDtoMock().username;

      const user = generateUserMock();
      const passwordHash = 'HASH_PASSWORD';
      jest.spyOn(service, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      jest.spyOn(prismaService.user, 'update').mockResolvedValue({
        ...updateUserDto,
        ...user,
      } as any);

      const result = await service.update(username, updateUserDto);
      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { username },
        data: {
          ...updateUserDto,
          password: passwordHash,
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

      await expect(service.update('jDoe', {} as any)).rejects.toThrow(
        NotFoundException,
      );
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

      await expect(service.update('jDoe2', updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('<Delete />', () => {
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
});
