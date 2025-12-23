import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SupabaseGuard } from '../../common/guards/supabase.guard';
import { UserProfileResponseDto } from './models/profile-response.dto';
import { SignUpDto, SignInDto, RequestPasswordResetDto, ResetPasswordDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or email already exists' })
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.name,
      signUpDto.p_lastname,
      signUpDto.m_lastname,
    );
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(SupabaseGuard)
  @Post('signout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out current user' })
  @ApiResponse({ status: 200, description: 'User signed out successfully' })
  signOut(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.signOut(token);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto.newPassword, '');
  }

  @UseGuards(SupabaseGuard)
  @Post('pr-check')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check if user profile registration is complete' })
  @ApiResponse({ status: 200, description: 'Registration status returned' })
  checkRegister(@Request() req) {
    return this.authService.check_pr(req.user.id);
  }

  @UseGuards(SupabaseGuard)
  @Post('pr-complete')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mark user profile registration as complete' })
  @ApiResponse({ status: 200, description: 'Registration completed' })
  completeRegister(@Request() req) {
    return this.authService.complete_pr(req.user.id);
  }

  @UseGuards(SupabaseGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile with roles and permissions' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req): Promise<UserProfileResponseDto> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('Could not identify user from token');
    }
    return this.authService.getProfile(req.user.id);
  }
}