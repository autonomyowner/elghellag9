import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NurseriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.nursery.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || 'DZD',
        quantity: data.quantity,
        location: data.location,
        coordinates: data.coordinates,
        contactPhone: data.contactPhone,
        images: data.images || [],
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 20,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where: any = { isAvailable: true };

    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      this.prisma.nursery.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
          },
        },
      }),
      this.prisma.nursery.count({ where }),
    ]);

    return {
      items,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.nursery.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true, isVerified: true, location: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Nursery listing not found');

    await this.prisma.nursery.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return item;
  }

  async update(id: string, userId: string, data: any) {
    const item = await this.prisma.nursery.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Nursery listing not found');
    if (item.userId !== userId) throw new ForbiddenException('You can only update your own listings');

    return this.prisma.nursery.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.nursery.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Nursery listing not found');
    if (item.userId !== userId) throw new ForbiddenException('You can only delete your own listings');

    await this.prisma.nursery.delete({ where: { id } });
    return { success: true };
  }

  async findByUser(userId: string) {
    return this.prisma.nursery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeatured(limit = 10) {
    return this.prisma.nursery.findMany({
      where: { isAvailable: true, isFeatured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
  }
}
