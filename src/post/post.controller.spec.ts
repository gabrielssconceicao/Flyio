import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { jwtConfigurationMock, jwtServiceMock } from '../auth/mocks';
import jwtConfig from '../auth/config/jwt.config';
import { generateCreatePostDtoMock, postMock } from './mock';
import { generateFileMock } from '../cloudinary/mocks';
import { generateTokenPayloadDtoMock } from '../auth/mocks';
describe('PostController', () => {
  let controller: PostController;
  let postService: PostService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn(),
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

    controller = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(postService).toBeDefined();
  });

  describe('<Create />', () => {
    it('should create a post', async () => {
      jest.spyOn(postService, 'create').mockResolvedValue(postMock as any);
      const result = await controller.create(
        generateCreatePostDtoMock(),
        [generateFileMock()],
        generateTokenPayloadDtoMock(),
      );
      expect(result).toEqual(postMock);
      expect(postService.create).toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });
  });
});
