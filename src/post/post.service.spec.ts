import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { postPrismaService } from '../prisma/mock/prisma.service.mock';
import { generateTokenPayloadDtoMock } from '../auth/mocks';
import { TokenPayloadDto } from '../auth/dto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto';
import { postMock, generateCreatePostDtoMock } from './mock';
import { PostEntity } from './entities/post.entity';
describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let createPostDto: CreatePostDto;
  let post: PostEntity;
  let tokenPayload: TokenPayloadDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: postPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);

    createPostDto = generateCreatePostDtoMock();
    post = postMock;
    tokenPayload = generateTokenPayloadDtoMock();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('<CreatePost />', () => {
    it('should create a post without images', async () => {
      jest.spyOn(prismaService.post, 'create').mockResolvedValue(post as any);

      const result = await service.create(createPostDto, [], tokenPayload);
      expect(prismaService.post.create).toHaveBeenCalled();
      expect(result).toEqual(post);
      expect(result).toMatchSnapshot();
    });
  });
});
