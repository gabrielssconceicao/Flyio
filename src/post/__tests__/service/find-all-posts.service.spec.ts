import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateTokenPayloadDtoMock } from 'src/auth/mocks';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { TokenPayloadDto } from 'src/auth/dto';
import { PostService } from '../../post.service';
import { generateFindAllPostsDtoMock } from '../../mock';
import { permissionServiceMock } from 'src/permission/mock/permission.service.mock';
import { PermissionService } from 'src/permission/permission.service';
describe('PostService - (findAll)', () => {
  let service: PostService;
  let prismaService: PrismaService;
  let cloudinary: CloudinaryService;
  let tokenPayload: TokenPayloadDto;
  let findAllPosts: ReturnType<typeof generateFindAllPostsDtoMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            findAll: jest.fn(),
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

    findAllPosts = generateFindAllPostsDtoMock();
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

  it('should find all posts', async () => {
    jest.spyOn(prismaService, 'findAll').mockResolvedValue({
      count: findAllPosts.count,
      items: [
        {
          ...findAllPosts.items[0],
          PostLikes: 0,
          _count: { comments: 0, PostLikes: 0 },
        },
      ],
    });

    const result = await service.findAll(
      { limit: 10, offset: 0 },
      tokenPayload,
    );
    expect(prismaService.findAll).toHaveBeenCalled();
    expect(result).toEqual(findAllPosts);
    expect(result).toMatchSnapshot();
  });
});
