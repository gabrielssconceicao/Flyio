import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRelationsController } from './user-relations.controller';
import { UserRelationsService } from './user-relations.service';
import jwtConfig from '../auth/config/jwt.config';
import {
  jwtServiceMock,
  jwtConfigurationMock,
  generateTokenPayloadDtoMock,
} from '../auth/mocks';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FindAllPostsResponseDto } from '../post/dto';
import { generateFindAllPostsDtoMock } from '../post/mock';

describe('UserRelationsController', () => {
  let controller: UserRelationsController;
  let service: UserRelationsService;

  let username: string;
  let paginationDto: PaginationDto;
  let findAllPosts: FindAllPostsResponseDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRelationsController],
      providers: [
        {
          provide: UserRelationsService,
          useValue: {
            reactivate: jest.fn(),
            getAllPostsByUsername: jest.fn(),
            getAllLikedPostsByUsername: jest.fn(),
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

    controller = module.get<UserRelationsController>(UserRelationsController);
    service = module.get<UserRelationsService>(UserRelationsService);
    username = 'username';
    paginationDto = {
      offset: 1,
      limit: 10,
    };
    findAllPosts = generateFindAllPostsDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('<Reactivate />', () => {
    it('should reactivate a user successfully', async () => {
      const reactivateUserDto = {
        token: 'token',
      };
      const message = 'User reactivated successfully';
      jest.spyOn(service, 'reactivate').mockResolvedValue({ message });
      const result = await controller.reactivate(reactivateUserDto);
      expect(service.reactivate).toHaveBeenCalledWith(reactivateUserDto);
      expect(result).toEqual({ message });
      expect(result).toMatchSnapshot();
    });
  });

  describe('<GetAllPostsByUsername />', () => {
    it('should get all posts by username successfully', async () => {
      jest
        .spyOn(service, 'getAllPostsByUsername')
        .mockResolvedValue(findAllPosts);
      const result = await controller.getAllPostsByUsername(
        username,
        paginationDto,
        generateTokenPayloadDtoMock(),
      );
      expect(service.getAllPostsByUsername).toHaveBeenCalledWith(
        username,
        paginationDto,
        generateTokenPayloadDtoMock(),
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('<GetAllLikedPostsByUsername />', () => {
    it('should get all posts by username successfully', async () => {
      findAllPosts.items = findAllPosts.items.map((post) => ({
        ...post,
        liked: true,
      }));
      jest
        .spyOn(service, 'getAllLikedPostsByUsername')
        .mockResolvedValue(findAllPosts);
      const result = await controller.getAllPostsByUsername(
        username,
        paginationDto,
        generateTokenPayloadDtoMock(),
      );
      expect(service.getAllPostsByUsername).toHaveBeenCalledWith(
        username,
        paginationDto,
        generateTokenPayloadDtoMock(),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
