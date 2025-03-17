import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PostController } from '../../post.controller';
import { PostService } from '../../post.service';
import { jwtConfigurationMock, jwtServiceMock } from 'src/auth/mocks';
import jwtConfig from 'src/auth/config/jwt.config';
import {
  generateCreatePostDtoMock,
  generateFindAllPostsDtoMock,
  generatedPostMock,
} from '../../mock';
import { TokenPayloadDto } from 'src/auth/dto';
import { generateTokenPayloadDtoMock } from 'src/auth/mocks';
import { generateFileMock } from 'src/cloudinary/mocks';
import { PostEntity } from '../../entities/post.entity';

describe('PostController', () => {
  let controller: PostController;
  let postService: PostService;

  let postMock: PostEntity;
  let tokenPayload: TokenPayloadDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            like: jest.fn(),
            unlike: jest.fn(),
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

    postMock = generatedPostMock();
    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('<FindAll/>', () => {
    it('should find all posts', async () => {
      jest
        .spyOn(postService, 'findAll')
        .mockResolvedValue(generateFindAllPostsDtoMock());

      const result = await controller.findAll(
        { limit: 10, offset: 0 },
        tokenPayload,
      );
      expect(postService.findAll).toHaveBeenCalled();
      expect(result).toEqual(generateFindAllPostsDtoMock());
    });
  });

  describe('<FindOne />', () => {
    it('should return a post', async () => {
      jest.spyOn(postService, 'findOne').mockResolvedValue(postMock as any);

      const result = await controller.findOne('fakeId', tokenPayload);
      expect(result).toEqual(postMock);
      expect(postService.findOne).toHaveBeenCalled();
    });
  });

  describe('<Delete />', () => {
    it('should delete a post', async () => {
      jest.spyOn(postService, 'remove').mockResolvedValue();

      await controller.remove('42-d-f-df4', generateTokenPayloadDtoMock());
      expect(postService.remove).toHaveBeenCalled();
    });
  });

  describe('<Like />', () => {
    it('should like a post', async () => {
      jest.spyOn(postService, 'like').mockResolvedValue();

      await controller.like('42-d-f-df4', tokenPayload);
      expect(postService.like).toHaveBeenCalled();
    });
  });

  describe('<Unlike />', () => {
    it('should like a post', async () => {
      jest.spyOn(postService, 'unlike').mockResolvedValue();

      await controller.unlike('42-d-f-df4', tokenPayload);
      expect(postService.unlike).toHaveBeenCalled();
    });
  });
});
