import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  generatedPostMock,
  generateCreatePostDtoMock,
  generateFindAllPostsDtoMock,
} from './mock';
import { PostEntity } from './entities/post.entity';
import { permissionServiceMock } from '../permission/mock/permission.service.mock';
import { PermissionService } from '../permission/permission.service';
describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let cloudinary: CloudinaryService;
  let createPostDto: CreatePostDto;
  let post: PostEntity;
  let tokenPayload: TokenPayloadDto;
  let id: string;
  let servicePost: PostEntity & {
    _count: { PostLikes: number };
    PostLikes?: [];
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
        {
          provide: PermissionService,
          useValue: permissionServiceMock,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinary = module.get<CloudinaryService>(CloudinaryService);

    createPostDto = generateCreatePostDtoMock();
    post = generatedPostMock();
    servicePost = { ...post, _count: { PostLikes: 0 } };
    tokenPayload = generateTokenPayloadDtoMock();
    id = post.id;
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

  // describe('<CreatePost />', () => {
  //   it('should create a post without images', async () => {
  //     jest
  //       .spyOn(prismaService.post, 'create')
  //       .mockResolvedValue(servicePost as any);

  //     const result = await service.create(createPostDto, [], tokenPayload);
  //     expect(prismaService.post.create).toHaveBeenCalled();
  //     expect(cloudinary.uploadPostImages).not.toHaveBeenCalled();
  //     expect(result).toEqual(post);
  //     expect(result.images.length).toBe(0);
  //     expect(result).toMatchSnapshot();
  //   });
  //   it('should create a post with images', async () => {
  //     jest
  //       .spyOn(prismaService.post, 'create')
  //       .mockResolvedValue(servicePost as any);
  //     jest
  //       .spyOn(cloudinary, 'uploadPostImages')
  //       .mockResolvedValue([generatedProfilePictureMock]);

  //     const result = await service.create(
  //       createPostDto,
  //       [generateFileMock()],
  //       tokenPayload,
  //     );
  //     expect(prismaService.post.create).toHaveBeenCalled();
  //     expect(cloudinary.uploadPostImages).toHaveBeenCalledWith([
  //       generateFileMock(),
  //     ]);
  //     expect(result).toEqual(post);
  //     expect(result.images.length).toBe(0);
  //     expect(result).toMatchSnapshot();
  //   });
  // });

  // describe('<FindAll/>', () => {
  //   it('should find all posts', async () => {
  //     servicePost.PostLikes = [];
  //     jest
  //       .spyOn(prismaService.post, 'findMany')
  //       .mockResolvedValue([servicePost] as any);
  //     jest.spyOn(prismaService.post, 'count').mockResolvedValue(1);

  //     const result = await service.findAll(
  //       { limit: 10, offset: 0 },
  //       tokenPayload,
  //     );
  //     expect(prismaService.post.findMany).toHaveBeenCalled();
  //     expect(prismaService.post.count).toHaveBeenCalled();
  //     expect(result).toEqual(generateFindAllPostsDtoMock());
  //   });
  // });

  // describe('<FindOne />', () => {
  //   it('should return a post', async () => {
  //     servicePost.PostLikes = [];
  //     jest
  //       .spyOn(prismaService.post, 'findUnique')
  //       .mockResolvedValue(servicePost as any);

  //     const result = await service.findOne(id, tokenPayload);
  //     expect(result).toEqual(post);
  //     expect(prismaService.post.findUnique).toHaveBeenCalled();
  //     expect(result).toMatchSnapshot();
  //   });

  //   it('shoud throw an NotFoundException', async () => {
  //     jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

  //     await expect(service.findOne(id, tokenPayload)).rejects.toThrow(
  //       NotFoundException,
  //     );

  //     expect(prismaService.post.findUnique).toHaveBeenCalled();
  //   });
  // });

  // describe('<Delete />', () => {
  //   it('should delete a post without images', async () => {
  //     jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
  //     jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

  //     await service.remove(id, tokenPayload);

  //     expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
  //     expect(prismaService.post.delete).toHaveBeenCalled();
  //   });
  //   it('should delete a post with images', async () => {
  //     post.images = [{ url: 'https://example.com/image.jpg', id: 'p-43-5' }];
  //     jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
  //     jest.spyOn(cloudinary, 'deletePostImages').mockResolvedValue({} as any);
  //     jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

  //     await service.remove(id, tokenPayload);

  //     expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
  //     expect(cloudinary.deletePostImages).toHaveBeenCalled();
  //     expect(prismaService.post.delete).toHaveBeenCalled();
  //   });

  //   it('should throw an NotFoundException', async () => {
  //     jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

  //     await expect(service.remove(id, tokenPayload)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });

  describe('<Like />', () => {
    it('should like a post', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
      jest
        .spyOn(prismaService.postLikes, 'create')
        .mockResolvedValue(post as any);

      await service.like(id, tokenPayload);

      expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
      expect(prismaService.postLikes.create).toHaveBeenCalled();
    });
    it('should throw an BadRequestException', async () => {
      post.liked = true;
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);

      await expect(service.like(id, tokenPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw an NotFoundException', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(id, tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('<Unlike />', () => {
    it('should unlike a post', async () => {
      post.liked = true;
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
      jest
        .spyOn(prismaService.postLikes, 'create')
        .mockResolvedValue({} as any);

      await service.unlike(id, tokenPayload);

      expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
      expect(prismaService.postLikes.delete).toHaveBeenCalled();
    });
    it('should throw an BadRequestException', async () => {
      post.liked = false;
      jest.spyOn(service, 'findOne').mockResolvedValue(post as any);

      await expect(service.unlike(id, tokenPayload)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw an NotFoundException', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(id, tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
