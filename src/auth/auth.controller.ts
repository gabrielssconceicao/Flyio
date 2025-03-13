import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, PickType } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, RefreshTokenDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Login ' })
  @ApiBody({
    type: LoginDto,
    description: 'User Login',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User or password invalid',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User or password invalid',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User not active',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User not active',
        error: 'Forbidden',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    description: 'Refresh token',
    type: RefreshTokenDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'New access token',
    type: PickType(LoginResponseDto, ['accessToken']),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Token expired',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Token expired',
        error: 'Forbidden',
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('refresh-token')
  refreshToken(@Body() refreshTokendto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokendto);
  }
}
