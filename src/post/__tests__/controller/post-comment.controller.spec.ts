import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentController } from '../../post-comment.controller';
import { PostCommentService } from '../../post-comment.service';
import { CommentDto } from '../../dto';
import { TokenPayloadDto } from 'src/auth/dto';
import {
  generateTokenPayloadDtoMock,
  jwtConfigurationMock,
  jwtServiceMock,
} from 'src/auth/mocks';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';

describe('PostController', () => {
  let controller: PostCommentController;
  let service: PostCommentService;

  let tokenPayload: TokenPayloadDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentController],
      providers: [
        {
          provide: PostCommentService,
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

    controller = module.get<PostCommentController>(PostCommentController);
    service = module.get<PostCommentService>(PostCommentService);

    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('<Create />', () => {
    it('should create a comment successfully', async () => {
      const commentDto: CommentDto = {
        id: '1',
        createdAt: new Date('2023-03-15 14:30:00'),
        content: 'test',
        user: { username: 'test', profileImg: null, name: 'test' },
      };
      const createCommentDto = { content: 'test' };
      jest.spyOn(service, 'create').mockResolvedValue(commentDto);

      const result = await controller.create(
        '1',
        createCommentDto,
        tokenPayload,
      );

      expect(service.create).toHaveBeenCalledWith(
        '1',
        createCommentDto,
        tokenPayload,
      );
      expect(result).toEqual(commentDto);
      expect(result).toMatchSnapshot();
    });
  });

  describe('<Delete />', () => {
    it('should delete a comment successfully', async () => {
      const commentId = '1';
      jest.spyOn(service, 'delete').mockResolvedValue();
      await controller.delete(commentId, tokenPayload);
      expect(service.delete).toHaveBeenCalledWith(commentId, tokenPayload);
    });
  });
});
