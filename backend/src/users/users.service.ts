import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreate(userId: string, data?: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.profile.create({
      data: {
        id: userId,
        email: data?.email,
        fullName: data?.fullName,
        phone: data?.phone,
        location: data?.location,
        userType: data?.userType || 'buyer',
      },
    });
  }

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        equipment: { take: 5, orderBy: { createdAt: 'desc' } },
        landListings: { take: 5, orderBy: { createdAt: 'desc' } },
        animals: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, data: UpdateProfileDto) {
    await this.findOrCreate(userId);

    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        location: data.location,
        avatarUrl: data.avatarUrl,
        userType: data.userType,
        bio: data.bio,
        website: data.website,
        socialLinks: data.socialLinks,
      },
    });
  }

  async getPublicProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        location: true,
        userType: true,
        isVerified: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            equipment: true,
            landListings: true,
            animals: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
