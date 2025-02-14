import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { PostImagesValidatorPipe } from '../cloudinary/pipes/post-image-validator.pipe';
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
  ) {
    console.log({ createPostDto, images });
    return this.postService.create(createPostDto);
  }
  findAll() {
    return this.postService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
