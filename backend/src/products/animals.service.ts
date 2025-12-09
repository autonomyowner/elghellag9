import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.animalListing.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency || 'DZD',
        animalType: data.animalType,
        breed: data.breed,
        ageMonths: data.ageMonths,
        gender: data.gender || 'male',
        quantity: data.quantity || 1,
        healthStatus: data.healthStatus,
        vaccinationStatus: data.vaccinationStatus || false,
        location: data.location,
        coordinates: data.coordinates,
        images: data.images || [],
        weightKg: data.weightKg,
        pricePerHead: data.pricePerHead ?? true,
        purpose: data.purpose || 'meat',
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
      animalType,
      location,
      minPrice,
      maxPrice,
      gender,
      purpose,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const where: any = { isAvailable: true };

    if (animalType) where.animalType = animalType;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (gender) where.gender = gender;
    if (purpose) where.purpose = purpose;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [items, total] = await Promise.all([
      this.prisma.animalListing.findMany({
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
      this.prisma.animalListing.count({ where }),
    ]);

    return {
      items,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.animalListing.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, phone: true, isVerified: true, location: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Animal listing not found');

    await this.prisma.animalListing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return item;
  }

  async update(id: string, userId: string, data: any) {
    const item = await this.prisma.animalListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Animal listing not found');
    if (item.userId !== userId) throw new ForbiddenException('You can only update your own listings');

    return this.prisma.animalListing.update({
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
    const item = await this.prisma.animalListing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Animal listing not found');
    if (item.userId !== userId) throw new ForbiddenException('You can only delete your own listings');

    await this.prisma.animalListing.delete({ where: { id } });
    return { success: true };
  }

  async findByUser(userId: string) {
    return this.prisma.animalListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFeatured(limit = 10) {
    return this.prisma.animalListing.findMany({
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
