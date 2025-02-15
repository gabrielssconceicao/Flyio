import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { postPrismaService } from '../prisma/mock/prisma.service.mock';
import { generateTokenPayloadDtoMock } from '../auth/mocks';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  generateFileMock,
  cloudinaryServiceMock,
  generatedProfilePictureMock,
} from '../cloudinary/mocks';
import { TokenPayloadDto } from '../auth/dto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto';
import { postMock, generateCreatePostDtoMock } from './mock';
import { PostEntity } from './entities/post.entity';
describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let cloudinary: CloudinaryService;
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
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);

    createPostDto = generateCreatePostDtoMock();
    post = postMock;
    tokenPayload = generateTokenPayloadDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cloudinary).toBeDefined();
  });

  describe('<CreatePost />', () => {
    it('should create a post without images', async () => {
      jest.spyOn(prismaService.post, 'create').mockResolvedValue(post as any);

      const result = await service.create(createPostDto, [], tokenPayload);
      expect(prismaService.post.create).toHaveBeenCalled();
      expect(cloudinary.uploadPostImages).not.toHaveBeenCalled();
      expect(result).toEqual(post);
      expect(result.images.length).toBe(0);
      expect(result).toMatchSnapshot();
    });
    it('should create a post with images', async () => {
      jest.spyOn(prismaService.post, 'create').mockResolvedValue(post as any);
      jest
        .spyOn(cloudinary, 'uploadPostImages')
        .mockResolvedValue([generatedProfilePictureMock]);

      const result = await service.create(
        createPostDto,
        [generateFileMock()],
        tokenPayload,
      );
      expect(prismaService.post.create).toHaveBeenCalled();
      expect(cloudinary.uploadPostImages).toHaveBeenCalledWith([
        generateFileMock(),
      ]);
      expect(result).toEqual(post);
      expect(result.images.length).toBe(0);
      expect(result).toMatchSnapshot();
    });
  });
});
