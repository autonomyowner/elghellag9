import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class AuthService {
  private clerk;

  constructor(private configService: ConfigService) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
    });
  }

  async verifyToken(token: string) {
    try {
      const { sub, ...claims } = await this.clerk.verifyToken(token);
      return { userId: sub, claims };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUser(userId: string) {
    try {
      const user = await this.clerk.users.getUser(userId);
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      };
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }
}
