import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login() {
    return 'Login';
  }

  @Post('logout')
  logout() {
    return 'Logout';
  }
}
