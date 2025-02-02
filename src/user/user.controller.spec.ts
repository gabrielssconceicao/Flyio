import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
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
import { generateFileMock } from '../cloudinary/mock/file.mock';
import { JwtService } from '@nestjs/jwt';
import { jwtServiceMock } from 'src/auth/mocks/jwt.service.mock';
import jwtConfig from 'src/auth/config/jwt.config';
import { jwtConfigurationMock } from 'src/auth/mocks/jwt.configuration.mock';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { FindAllUsersResponseDto } from './dto/find-all-users.dto';

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: UserService;

  //mocks
  let createUserDto: CreateUserDto;
  let file: Express.Multer.File;
  let user: User;
  let users: FindAllUsersResponseDto;
  let username: string;
  let id: string;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            removeProfilePicture: jest.fn(),
            reactivate: jest.fn(),
          },
        },

        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfigurationMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userServiceMock = module.get<UserService>(UserService);

    // mocks
    createUserDto = generateCreateUserDtoMock(true);
    file = generateFileMock();
    user = generateUserMock();
    users = generateFindAllUsersResponseDtoMock();

    username = 'jDoe';
    id = 'f-3wds';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userServiceMock).toBeDefined();
  });

  describe('<Create/ >', () => {
    it('should create a user', async () => {
      jest.spyOn(userServiceMock, 'create').mockResolvedValue(user);

      const result = await controller.create(createUserDto, file);
      expect(userServiceMock.create).toHaveBeenCalledWith(createUserDto, file);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw ConflictException when email or username is already in use', async () => {
      jest
        .spyOn(userServiceMock, 'create')
        .mockRejectedValue(
          new ConflictException(
            'This email or username is already associated with an existing account',
          ),
        );

      await expect(controller.create(createUserDto, undefined)).rejects.toThrow(
        ConflictException,
      );
      await expect(
        controller.create(createUserDto, undefined),
      ).rejects.toMatchSnapshot();
    });
  });

  describe('<FindAll />', () => {
    it('should return an array of users if user is logged in and token is valid', async () => {
      const query = {
        search: 'jD',
        limit: 1,
        offset: 0,
      };
      jest.spyOn(userServiceMock, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(userServiceMock.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(users);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<FindOne />', () => {
    it('should return a user successfully', async () => {
      jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(user);
      const result = await controller.findOne(username);
      expect(userServiceMock.findOne).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      jest
        .spyOn(userServiceMock, 'findOne')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findOne(username)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.findOne(username)).rejects.toMatchSnapshot();
    });
  });

  describe('<Update />', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        name: 'John Doe',
        bio: 'Update bio',
      };

      const updatedUser = { ...user, ...updateUserDto };
      jest.spyOn(userServiceMock, 'update').mockResolvedValue(updatedUser);
      const result = await controller.update(id, updateUserDto, file);

      expect(userServiceMock.update).toHaveBeenCalledWith(
        id,
        updateUserDto,
        file,
      );
      expect(result).toEqual(updatedUser);
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      jest
        .spyOn(userServiceMock, 'update')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.update(id, {}, undefined)).rejects.toThrow(
        NotFoundException,
      );
      await expect(
        controller.update(id, {}, undefined),
      ).rejects.toMatchSnapshot();
    });
    it('should throw an ConflictException', async () => {
      const updateUserDto = {
        email: 'john@example.com',
      };
      jest
        .spyOn(userServiceMock, 'update')
        .mockRejectedValue(
          new ConflictException(
            'Email is already associated with an existing account',
          ),
        );
      await expect(
        controller.update(id, updateUserDto, undefined),
      ).rejects.toThrow(ConflictException);
      await expect(
        controller.update(id, updateUserDto, undefined),
      ).rejects.toMatchSnapshot();
    });
  });

  describe('<Delete />', () => {
    it('should delete a user successfully', async () => {
      const message = 'User deleted successfully';
      jest.spyOn(userServiceMock, 'remove').mockResolvedValue({ message });
      const result = await controller.remove(id);
      expect(userServiceMock.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message });
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      jest
        .spyOn(userServiceMock, 'remove')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(id)).rejects.toMatchSnapshot();
    });
  });

  describe('<RemoveProfilePicture />', () => {
    it('should remove profile picture successfully', async () => {
      user = { ...user, profileImg: null };
      jest
        .spyOn(userServiceMock, 'removeProfilePicture')
        .mockResolvedValue(user);
      const result = await controller.removeProfileImg(username);
      expect(userServiceMock.removeProfilePicture).toHaveBeenCalledWith(
        username,
      );
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw an BadRequestException if an error occurs', async () => {
      jest
        .spyOn(userServiceMock, 'removeProfilePicture')
        .mockRejectedValue(new BadRequestException());
      await expect(controller.removeProfileImg(username)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('<Reactivate />', () => {
    it('should reactivate a user successfully', async () => {
      const reactivateUserDto = {
        token: 'token',
      };
      const message = 'User reactivated successfully';
      jest.spyOn(userServiceMock, 'reactivate').mockResolvedValue({ message });
      const result = await controller.reactivate(reactivateUserDto);
      expect(userServiceMock.reactivate).toHaveBeenCalledWith(
        reactivateUserDto,
      );
      expect(result).toEqual({ message });
      expect(result).toMatchSnapshot();
    });
    it('should thow an UnauthorizedException if token is invalid or expired', async () => {
      const reactivateUserDto = {
        token: 'expired-token',
      };
      jest
        .spyOn(userServiceMock, 'reactivate')
        .mockRejectedValue(new UnauthorizedException());
      await expect(controller.reactivate(reactivateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
