import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: { email: string; password: string }) {
    return this.authService.signUp(signUpDto.email, signUpDto.password);
  }

  @Post('signin')
  signIn(@Body() signInDto: { email: string; password: string }) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.signOut(token);
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('password-reset')
  resetPassword(@Body() resetData: { newPassword: string, token: string }) {
    return this.authService.resetPassword(resetData.newPassword, resetData.token);
  }
}