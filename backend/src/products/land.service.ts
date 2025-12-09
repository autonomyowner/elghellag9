import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { QueryLandDto } from './dto/query-land.dto';

@Injectable()
export class LandService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateLandDto) {
    return this.prisma.landListing.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || 'DZD',
        listingType: data.listingType || 'sale',
        areaSize: data.areaSize,
        areaUnit: data.areaUnit || 'hectare',
        location: data.location,
        coordinates: data.coordinates,
        contactPhone: data.contactPhone,
        waterSource: data.waterSource,
        images: data.images || [],
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
  }

  async findAll(query: QueryLandDto) {
    const {
      page = 1,
      limit = 20,
      listingType,
      location,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where: any = {
      isAvailable: true,
    };

    if (listingType) where.listingType = listingType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (minArea || maxArea) {
      where.areaSize = {};
      if (minArea) where.areaSize.gte = minArea;
      if (maxArea) where.areaSize.lte = maxArea;
    }

    const [items, total] = await Promise.all([
      this.prisma.landListing.findMany({
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
      this.prisma.landListing.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.landListing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true, isVerified: true, location: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Land listing not found');
    }

    await this.prisma.landListing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return item;
  }

  async update(id: string, userId: string, data: UpdateLandDto) {
    const item = await this.prisma.landListing.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Land listing not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    return this.prisma.landListing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        listingType: data.listingType,
        areaSize: data.areaSize,
        areaUnit: data.areaUnit,
        location: data.location,
        coordinates: data.coordinates,
        contactPhone: data.contactPhone,
        waterSource: data.waterSource,
        images: data.images,
        isAvailable: data.isAvailable,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.landListing.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Land listing not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.prisma.landListing.delete({ where: { id } });
    return { success: true };
  }

  async findByUser(userId: string) {
    return this.prisma.landListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeatured(limit = 10) {
    return this.prisma.landListing.findMany({
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
