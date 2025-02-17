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
import {
  postMock,
  generateCreatePostDtoMock,
  generateFindAllPostsDtoMock,
} from './mock';
import { PostEntity } from './entities/post.entity';
import { NotFoundException } from '@nestjs/common';
describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let cloudinary: CloudinaryService;
  let createPostDto: CreatePostDto;
  let post: PostEntity;
  let tokenPayload: TokenPayloadDto;
  let id: string;
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
    id = post.id;
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

  describe('<FindAll/>', () => {
    it('should find all posts', async () => {
      jest
        .spyOn(prismaService.post, 'findMany')
        .mockResolvedValue([post] as any);
      jest.spyOn(prismaService.post, 'count').mockResolvedValue(1);

      const result = await service.findAll({ limit: 10, offset: 0 });
      expect(prismaService.post.findMany).toHaveBeenCalled();
      expect(prismaService.post.count).toHaveBeenCalled();
      expect(result).toEqual(generateFindAllPostsDtoMock());
    });
  });

  describe('<FindOne />', () => {
    it('should return a post', async () => {
      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValue(post as any);

      const result = await service.findOne(id);
      expect(result).toEqual(post);
      expect(prismaService.post.findUnique).toHaveBeenCalled();
      expect(result).toMatchSnapshot();
    });

    it('shoud throw an NotFoundException', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);

      expect(prismaService.post.findUnique).toHaveBeenCalled();
    });
  });

  describe('<Delete />', () => {
    it('should delete a post without images', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
      jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

      await service.remove(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(prismaService.post.delete).toHaveBeenCalled();
    });
    it('should delete a post with images', async () => {
      post.images = [{ url: 'https://example.com/image.jpg', id: 'p-43-5' }];
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
      jest.spyOn(cloudinary, 'deletePostImages').mockResolvedValue({} as any);
      jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

      await service.remove(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(cloudinary.deletePostImages).toHaveBeenCalled();
      expect(prismaService.post.delete).toHaveBeenCalled();
    });

    it('should throw an NotFoundException', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
