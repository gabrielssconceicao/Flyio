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
describe('PostService - (remove)', () => {
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
              delete: jest.fn(),
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
    id = post.id;
    tokenPayload = generateTokenPayloadDtoMock();
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

  it('should delete a post without images', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
    jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

    await service.remove(id, tokenPayload);

    expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
    expect(prismaService.post.delete).toHaveBeenCalled();
  });

  it('should delete a post with images', async () => {
    post.images = [{ url: 'https://example.com/image.jpg', id: 'p-43-5' }];
    jest.spyOn(service, 'findOne').mockResolvedValue(post as any);
    jest.spyOn(cloudinary, 'deletePostImages').mockResolvedValue({} as any);
    jest.spyOn(prismaService.post, 'delete').mockResolvedValue({} as any);

    await service.remove(id, tokenPayload);

    expect(service.findOne).toHaveBeenCalledWith(id, tokenPayload);
    expect(cloudinary.deletePostImages).toHaveBeenCalled();
    expect(prismaService.post.delete).toHaveBeenCalled();
  });

  it('should throw an NotFoundException', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(service.remove(id, tokenPayload)).rejects.toThrow(
      NotFoundException,
    );
  });
});
