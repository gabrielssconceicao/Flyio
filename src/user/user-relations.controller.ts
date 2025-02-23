import { Controller, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReactivateUserDto } from './dto';
import { UserRelationsService } from './user-relations.service';

@ApiTags('Users')
@Controller('users')
export class UserRelationsController {
  constructor(private readonly userRelationsService: UserRelationsService) {}

  @ApiOperation({ summary: 'Reactivate user by token' })
  @ApiBody({
    type: ReactivateUserDto,
    description: 'Reactivate user by token',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account reactivated successfully.',
    schema: {
      example: {
        message: 'Account reactivated successfully',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token.',
    schema: {
      example: {
        message: 'Invalid or expired token',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Patch('reactivate/:token')
  reactivate(@Param() reactivateUserDto: ReactivateUserDto) {
    return this.userRelationsService.reactivate(reactivateUserDto);
  }
}
