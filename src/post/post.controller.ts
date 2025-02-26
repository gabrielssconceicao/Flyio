import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  HttpStatus,
  Get,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ApiAuthResponses } from '../common/decorators/guard.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { PostImagesValidatorPipe } from '../cloudinary/pipes/post-image-validator.pipe';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';
import { PostEntity } from './entities/post.entity';
import { FindAllPostsResponseDto } from './dto/find-all-posts.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('post')
@ApiBearerAuth()
@ApiAuthResponses()
@UseGuards(AuthTokenGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Create a post for user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a post for user',
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Post text',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files (PNG or JPEG)',
        },
      },
      required: ['text'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post created successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File upload failed due to invalid file type or size limit.',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid file type or file too small/too large',
        error: 'Bad Request',
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles(PostImagesValidatorPipe) images: Express.Multer.File[],
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.create(createPostDto, images, tokenPayload);
  }

  @ApiOperation({ summary: 'Get all posts' })
  @ApiQuery({
    name: 'limit',
    description: 'Number of posts to return per page',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of posts to skip for pagination',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Posts fetched successfully',
    type: FindAllPostsResponseDto,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() paginationDto: PaginationDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.findAll(paginationDto, tokenPayload);
  }

  @ApiOperation({ summary: 'Get post by id' })
  @ApiParam({
    name: 'id',
    description: 'Post id',
    required: true,
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post fetched successfully',
    type: PostEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.findOne(id, tokenPayload);
  }

  @ApiOperation({ summary: 'Delete post by id' })
  @ApiParam({
    name: 'id',
    description: 'Post id',
    required: true,
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - User does not own the post',
    content: {
      'application/json': {
        example: {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'You do not have permission',
          error: 'Forbidden',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.remove(id, tokenPayload);
  }

  @ApiOperation({ summary: 'Like post by id' })
  @ApiParam({
    name: 'id',
    description: 'Post id',
    required: true,
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post liked successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Post already liked',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Post already liked',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/like')
  likePost(
    @Param('id') postId: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.like(postId, tokenPayload);
  }

  @ApiOperation({ summary: 'Unlike post by id' })
  @ApiParam({
    name: 'id',
    description: 'Post id',
    required: true,
    example: '42-d-f-df4',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post unliked successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Post not liked',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Post not liked',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Post not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
        error: 'Not Found',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/unlike')
  unlikePost(
    @Param('id') postId: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.postService.unlike(postId, tokenPayload);
  }
}
