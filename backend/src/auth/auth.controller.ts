import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClerkGuard } from './guards/clerk.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info from Clerk' })
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getUser(user.userId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a Clerk token' })
  async verifyToken(@Body('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
