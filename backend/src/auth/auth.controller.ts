import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; role?: 'hr' | 'employee' }) {
    return this.authService.register(body.email, body.password, body.name, body.role);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    if (token) return this.authService.logout(token);
  }
}
