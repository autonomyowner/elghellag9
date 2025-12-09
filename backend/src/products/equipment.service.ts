import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateEquipmentDto) {
    return this.prisma.equipment.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || 'DZD',
        categoryId: data.categoryId,
        condition: data.condition || 'good',
        year: data.year,
        brand: data.brand,
        model: data.model,
        hoursUsed: data.hoursUsed,
        location: data.location,
        coordinates: data.coordinates,
        contactPhone: data.contactPhone,
        images: data.images || [],
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
        category: true,
      },
    });
  }

  async findAll(query: QueryEquipmentDto) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      location,
      minPrice,
      maxPrice,
      condition,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where: any = {
      isAvailable: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (condition) where.condition = condition;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
          },
          category: true,
        },
      }),
      this.prisma.equipment.count({ where }),
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
    const item = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true, isVerified: true, location: true },
        },
        category: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Equipment not found');
    }

    // Increment view count
    await this.prisma.equipment.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return item;
  }

  async update(id: string, userId: string, data: UpdateEquipmentDto) {
    const item = await this.prisma.equipment.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Equipment not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    return this.prisma.equipment.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        categoryId: data.categoryId,
        condition: data.condition,
        year: data.year,
        brand: data.brand,
        model: data.model,
        hoursUsed: data.hoursUsed,
        location: data.location,
        coordinates: data.coordinates,
        contactPhone: data.contactPhone,
        images: data.images,
        isAvailable: data.isAvailable,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
        category: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const item = await this.prisma.equipment.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException('Equipment not found');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.prisma.equipment.delete({ where: { id } });
    return { success: true };
  }

  async findByUser(userId: string) {
    return this.prisma.equipment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async getFeatured(limit = 10) {
    return this.prisma.equipment.findMany({
      where: { isAvailable: true, isFeatured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
        },
        category: true,
      },
    });
  }
}
