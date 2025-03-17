import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateTokenPayloadDtoMock } from 'src/auth/mocks';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { TokenPayloadDto } from 'src/auth/dto';
import { PostService } from '../../post.service';
import { generatedPostMock } from '../../mock';
import { PostEntity } from '../../entities/post.entity';
import { permissionServiceMock } from 'src/permission/mock/permission.service.mock';
import { PermissionService } from 'src/permission/permission.service';
import { NotFoundException } from '@nestjs/common';
describe('PostService - (findOne)', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let cloudinary: CloudinaryService;
  let post: PostEntity;
  let tokenPayload: TokenPayloadDto;
  let id: string;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findUnique: jest.fn(),
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

    post = generatedPostMock();
    tokenPayload = generateTokenPayloadDtoMock();
    tokenPayload = generateTokenPayloadDtoMock();

    id = 'p-43-5';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cloudinary).toBeDefined();
  });

  it('should return a post', async () => {
    jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue({
      ...post,
      _count: {
        PostLikes: 0,
        comments: 0,
      },
      comments: [],
      PostLikes: [],
    } as any);

    const result = await service.findOne(id, tokenPayload);
    expect(prismaService.post.findUnique).toHaveBeenCalled();
    expect(result).toMatchSnapshot();
  });

  it('shoud throw an NotFoundException', async () => {
    jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);

    await expect(service.findOne(id, tokenPayload)).rejects.toThrow(
      NotFoundException,
    );

    expect(prismaService.post.findUnique).toHaveBeenCalled();
  });
});
