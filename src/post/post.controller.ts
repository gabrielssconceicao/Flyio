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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Posts fetched successfully',
    type: FindAllPostsResponseDto,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.postService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get post by id' })
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
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete post by id' })
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
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
