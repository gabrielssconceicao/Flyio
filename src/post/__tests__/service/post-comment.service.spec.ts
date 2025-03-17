import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateTokenPayloadDtoMock } from 'src/auth/mocks';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { TokenPayloadDto } from 'src/auth/dto';
import { PostCommentService } from '../../post-comment.service';
import { CommentDto, CreateCommentDto } from '../../dto';
import { generatedPostMock } from '../../mock';
import { permissionServiceMock } from 'src/permission/mock/permission.service.mock';
import { PermissionService } from 'src/permission/permission.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('PostCommentService', () => {
  let service: PostCommentService;
  let prismaService: PrismaService;
  let permissionService: PermissionService;

  let createPostDto: CreateCommentDto;
  let tokenPayload: TokenPayloadDto;
  let postId: string;
  let comment: CommentDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostCommentService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findUnique: jest.fn(),
            },
            comment: {
              create: jest.fn(),
              findUnique: jest.fn(),
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

    service = module.get<PostCommentService>(PostCommentService);
    prismaService = module.get<PrismaService>(PrismaService);
    permissionService = module.get<PermissionService>(PermissionService);

    createPostDto = { content: 'Hello world' };
    tokenPayload = generateTokenPayloadDtoMock();
    postId = 'id-1';
    comment = {
      id: 'comment-id',
      content: 'Hi',
      createdAt: new Date('2025-03-16T20:44:43.597Z'),
      user: { name: 'John Doe', username: 'jDoe', profileImg: null },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('<Create />', () => {
    it('should create a post successfully', async () => {
      jest
        .spyOn(prismaService.post, 'findUnique')
        .mockResolvedValue(generatedPostMock() as any);
      jest
        .spyOn(prismaService.comment, 'create')
        .mockResolvedValue(comment as any);
      const result = await service.create(postId, createPostDto, tokenPayload);

      expect(prismaService.post.findUnique).toHaveBeenCalled();
      expect(prismaService.comment.create).toHaveBeenCalled();
      expect(result).toEqual(comment);
      expect(result).toMatchSnapshot();
    });

    it('should throw NotFoundException if post is not found', async () => {
      jest.spyOn(prismaService.post, 'findUnique').mockResolvedValue(null);
      await expect(
        service.create(postId, createPostDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('<Delete />', () => {
    it('should delete a comment successfully', async () => {
      jest
        .spyOn(prismaService.comment, 'findUnique')
        .mockResolvedValue(comment as any);
      jest.spyOn(prismaService.comment, 'delete').mockResolvedValue({} as any);
      await service.delete('comment-id', tokenPayload);
      expect(prismaService.comment.findUnique).toHaveBeenCalled();
      expect(prismaService.comment.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if comment is not found', async () => {
      jest.spyOn(prismaService.comment, 'findUnique').mockResolvedValue(null);
      await expect(service.delete('comment-id', tokenPayload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is trying to delete other user comment', async () => {
      jest
        .spyOn(prismaService.comment, 'findUnique')
        .mockResolvedValue(comment as any);
      jest
        .spyOn(permissionService, 'verifyUserOwnership')
        .mockImplementation(() => {
          throw new ForbiddenException();
        });
      await expect(service.delete('comment-id', tokenPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
