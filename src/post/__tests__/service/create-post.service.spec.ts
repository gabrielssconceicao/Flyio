import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateTokenPayloadDtoMock } from 'src/auth/mocks';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  generateFileMock,
  cloudinaryServiceMock,
  generatedProfilePictureMock,
} from 'src/cloudinary/mocks';
import { TokenPayloadDto } from 'src/auth/dto';
import { PostService } from '../../post.service';
import { CreatePostDto } from '../../dto';
import { generatedPostMock, generateCreatePostDtoMock } from '../../mock';
import { PostEntity } from '../../entities/post.entity';
import { permissionServiceMock } from 'src/permission/mock/permission.service.mock';
import { PermissionService } from 'src/permission/permission.service';
describe('PostService - (create)', () => {
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
          useValue: {
            post: {
              create: jest.fn(),
            },
          },
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

  it('should create a post without images', async () => {
    jest
      .spyOn(prismaService.post, 'create')
      .mockResolvedValue({ ...post, _count: { PostLikes: 0 } } as any);

    const result = await service.create(createPostDto, [], tokenPayload);
    expect(prismaService.post.create).toHaveBeenCalled();
    expect(cloudinary.uploadPostImages).not.toHaveBeenCalled();
    expect(result).toEqual(post);
    expect(result.images.length).toBe(0);
    expect(result).toMatchSnapshot();
  });

  it('should create a post with images', async () => {
    jest
      .spyOn(prismaService.post, 'create')
      .mockResolvedValue({ ...post, _count: { PostLikes: 0 } } as any);
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
