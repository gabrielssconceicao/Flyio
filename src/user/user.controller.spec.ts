import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { createMockUser, createUserDtoMock } from 'src/mocks/user.mock';
import { FindAllUsersResponseDto } from './dto/find-all-users.dto';

describe('UserController', () => {
  let controller: UserController;
  const userServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('<Create/ >', () => {
    it('should create a user', async () => {
      const { id, active, ...rest } = createUserDtoMock;
      const createdUser: User = createMockUser();

      jest.spyOn(userServiceMock, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(rest);
      expect(userServiceMock.create).toHaveBeenCalledWith(rest);
      expect(result).toEqual(createdUser);
      expect(result).toMatchSnapshot();
    });
    it('should throw ConflictException when email is already in use', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        email: 'john@example.com',
        username: 'john_doe',
        password: 'password',
      };

      userServiceMock.create.mockRejectedValue(
        new ConflictException(
          'This email or username is already associated with an existing account',
        ),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
      await expect(controller.create(dto)).rejects.toMatchSnapshot();
    });
  });

  describe('<FindAll />', () => {
    it('should return an array of users', async () => {
      const users: FindAllUsersResponseDto = {
        count: 1,
        users: [
          {
            id: 'f-3wds',
            name: 'John Doe',
            username: 'jD',
            profileImg: 'http://profileImg.com',
          },
        ],
      };
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
      const username = createUserDtoMock.username;
      const user: User = createMockUser();
      jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(user);
      const result = await controller.findOne(username);
      expect(userServiceMock.findOne).toHaveBeenCalledWith(username);
      expect(result).toEqual(user);
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      const username = createUserDtoMock.username;
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
      const id = 'f-3wds';
      const updateUserDto = {
        name: 'John Doe',
        bio: 'Update bio',
      };

      jest
        .spyOn(userServiceMock, 'update')
        .mockResolvedValue({ ...createMockUser(), ...updateUserDto });
      const result = await controller.update(id, updateUserDto);

      expect(userServiceMock.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual({ ...createMockUser(), ...updateUserDto });
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      const id = 'f-3wds';
      jest
        .spyOn(userServiceMock, 'update')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.update(id, {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.update(id, {})).rejects.toMatchSnapshot();
    });
    it('should throw an ConflictException', async () => {
      const id = 'f-3wds';
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
      await expect(controller.update(id, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(
        controller.update(id, updateUserDto),
      ).rejects.toMatchSnapshot();
    });
  });
  describe('<Delete />', () => {
    it('should delete a user successfully', async () => {
      const id = 'f-3wds';
      const message = 'User deleted successfully';
      jest.spyOn(userServiceMock, 'remove').mockResolvedValue({ message });
      const result = await controller.remove(id);
      expect(userServiceMock.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message });
      expect(result).toMatchSnapshot();
    });
    it('should throw an NotFoundException', async () => {
      const id = 'f-3wds';
      jest
        .spyOn(userServiceMock, 'remove')
        .mockRejectedValue(new NotFoundException('User not found'));
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      await expect(controller.remove(id)).rejects.toMatchSnapshot();
    });
  });
});
