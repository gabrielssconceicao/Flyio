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
import { TokenPayloadDto } from 'src/auth/dto';

describe('UserRelationsController', () => {
  let controller: UserRelationsController;
  let service: UserRelationsService;

  let username: string;
  let paginationDto: PaginationDto;
  let findAllPosts: FindAllPostsResponseDto;
  let tokenPayload: TokenPayloadDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRelationsController],
      providers: [
        {
          provide: UserRelationsService,
          useValue: {
            getAllPostsByUsername: jest.fn(),
            getAllLikedPostsByUsername: jest.fn(),
            followUser: jest.fn(),
            unfollowUser: jest.fn(),
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
    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('<GetAllPostsByUsername />', () => {
    it('should get all posts by username successfully', async () => {
      jest
        .spyOn(service, 'getAllPostsByUsername')
        .mockResolvedValue(findAllPosts);
      const result = await controller.getAllPostsByUsername(
        username,
        paginationDto,
        tokenPayload,
      );
      expect(service.getAllPostsByUsername).toHaveBeenCalledWith(
        username,
        paginationDto,
        tokenPayload,
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
        tokenPayload,
      );
      expect(service.getAllPostsByUsername).toHaveBeenCalledWith(
        username,
        paginationDto,
        tokenPayload,
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('<FollowUser />', () => {
    it('should follow a user successfully', async () => {
      jest.spyOn(service, 'followUser').mockResolvedValue(null);
      await controller.followUser(username, tokenPayload);
      expect(service.followUser).toHaveBeenCalledWith(username, tokenPayload);
    });
  });

  describe('<UnfollowUser />', () => {
    it('should unfollow a user successfully', async () => {
      jest.spyOn(service, 'unfollowUser').mockResolvedValue(null);
      await controller.unfollowUser(username, tokenPayload);
      expect(service.unfollowUser).toHaveBeenCalledWith(username, tokenPayload);
    });
  });
});
