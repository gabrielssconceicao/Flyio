import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { jwtConfigurationMock, jwtServiceMock } from '../auth/mocks';
import jwtConfig from '../auth/config/jwt.config';
import {
  generateCreatePostDtoMock,
  generateFindAllPostsDtoMock,
  postMock,
} from './mock';
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
            findAll: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
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

      const result = await controller.findAll({ limit: 10, offset: 0 });
      expect(postService.findAll).toHaveBeenCalled();
      expect(result).toEqual(generateFindAllPostsDtoMock());
    });
  });

  describe('<FindOne />', () => {
    it('should return a post', async () => {
      jest.spyOn(postService, 'findOne').mockResolvedValue(postMock as any);

      const result = await controller.findOne('fakeId');
      expect(result).toEqual(postMock);
      expect(postService.findOne).toHaveBeenCalled();
    });
    it('shoud throw an NotFoundException', async () => {
      jest
        .spyOn(postService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('fakeId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('<Delete />', () => {
    it('should delete a post', async () => {
      jest.spyOn(postService, 'remove').mockResolvedValue();

      await controller.remove('42-d-f-df4', generateTokenPayloadDtoMock());
      expect(postService.remove).toHaveBeenCalled();
    });
    it('shoud throw an NotFoundException', async () => {
      jest
        .spyOn(postService, 'remove')
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.remove('42-d-f-df4', generateTokenPayloadDtoMock()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
