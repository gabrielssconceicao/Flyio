import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  refresh(@Body() refreshTokendto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokendto);
  }

  @Post('logout')
  logout() {
    return 'Logout';
  }
}
