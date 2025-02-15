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
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { PostImagesValidatorPipe } from '../cloudinary/pipes/post-image-validator.pipe';
import { TokenPayloadParam } from '../auth/params/token-payload.param';
import { TokenPayloadDto } from '../auth/dto';
import { PostEntity } from './entities/post.entity';
@Controller('post')
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
    description: 'File upload failed due to invalid file type.',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid file type',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File upload failed due to size limit.',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'File too small or too large',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Token invalid or missing',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Login Required',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Login required',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'FORBIDDEN - Token expired',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Token expired',
        error: 'Forbidden',
      },
    },
  })
  @UseGuards(AuthTokenGuard)
  @Post()
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
  findAll() {
    return this.postService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
