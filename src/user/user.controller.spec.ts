import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import jwtConfig from '../auth/config/jwt.config';
import {
  jwtServiceMock,
  jwtConfigurationMock,
  generateTokenPayloadDtoMock,
} from '../auth/mocks';
import { TokenPayloadDto } from '../auth/dto';
import { generateFileMock } from '../cloudinary/mocks';

import { CreateUserDto, FindAllUsersResponseDto } from './dto';
import {
  generateCreateUserDtoMock,
  generateFindAllUsersResponseDtoMock,
  generateUserMock,
} from './mocks';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  //mocks
  let createUserDto: CreateUserDto;
  let file: Express.Multer.File;
  let user: User;
  let users: FindAllUsersResponseDto;
  let username: string;
  let id: string;
  let tokenPayload: TokenPayloadDto;
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
            desactivateUser: jest.fn(),
            removeProfilePicture: jest.fn(),
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
    service = module.get<UserService>(UserService);

    // mocks
    createUserDto = generateCreateUserDtoMock(true);
    file = generateFileMock();
    user = generateUserMock();
    users = generateFindAllUsersResponseDtoMock();

    username = user.username;
    id = user.id;
    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('<Create/ >', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(user);

      const result = await controller.create(createUserDto, file);
      expect(service.create).toHaveBeenCalledWith(createUserDto, file);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw ConflictException when email or username is already in use', async () => {
      jest
        .spyOn(service, 'create')
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
      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(users);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<FindOne />', () => {
    it('should return a user successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(user);
      const result = await controller.findOne(username);
      expect(service.findOne).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      jest
        .spyOn(service, 'findOne')
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
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);
      const result = await controller.update(
        id,
        updateUserDto,
        file,
        tokenPayload,
      );

      expect(service.update).toHaveBeenCalledWith(
        id,
        updateUserDto,
        file,
        tokenPayload,
      );
      expect(result).toEqual(updatedUser);
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(
        controller.update(id, {}, undefined, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
    it('should throw an ConflictException', async () => {
      const updateUserDto = {
        email: 'john@example.com',
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new ConflictException(
            'Email is already associated with an existing account',
          ),
        );
      await expect(
        controller.update(id, updateUserDto, undefined, tokenPayload),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('<DesactivateUser />', () => {
    it('should delete a user successfully', async () => {
      const message = 'User desactivated successfully';
      jest.spyOn(service, 'desactivateUser').mockResolvedValue({ message });
      const result = await controller.desactivateUser(id, tokenPayload);
      expect(service.desactivateUser).toHaveBeenCalledWith(id, tokenPayload);
      expect(result).toEqual({ message });
      expect(result).toMatchSnapshot();
    });
    it('should throw an BadRequestException', async () => {
      jest
        .spyOn(service, 'desactivateUser')
        .mockRejectedValue(
          new BadRequestException('User is already deactivated'),
        );
      await expect(
        controller.desactivateUser(id, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('<RemoveProfilePicture />', () => {
    it('should remove profile picture successfully', async () => {
      user = { ...user, profileImg: null };
      jest.spyOn(service, 'removeProfilePicture').mockResolvedValue(user);
      const result = await controller.removeProfileImg(username, tokenPayload);
      expect(service.removeProfilePicture).toHaveBeenCalledWith(
        username,
        tokenPayload,
      );
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw an BadRequestException if an error occurs', async () => {
      jest
        .spyOn(service, 'removeProfilePicture')
        .mockRejectedValue(new BadRequestException());
      await expect(
        controller.removeProfileImg(username, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
