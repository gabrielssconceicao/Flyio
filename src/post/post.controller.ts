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

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
