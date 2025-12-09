import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        icon: data.icon || '',
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { equipment: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
        },
        parent: true,
        _count: {
          select: { equipment: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, data: any) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        icon: data.icon,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async seed() {
    const existingCategories = await this.prisma.category.count();
    if (existingCategories > 0) {
      return { message: 'Categories already seeded' };
    }

    const categories = [
      { name: 'Equipment', nameAr: 'المعدات', icon: 'tractor', sortOrder: 1 },
      { name: 'Livestock', nameAr: 'المواشي', icon: 'cow', sortOrder: 2 },
      { name: 'Land', nameAr: 'الأراضي', icon: 'land', sortOrder: 3 },
      { name: 'Vegetables', nameAr: 'الخضروات', icon: 'carrot', sortOrder: 4 },
      { name: 'Nurseries', nameAr: 'المشاتل', icon: 'seedling', sortOrder: 5 },
    ];

    await this.prisma.category.createMany({ data: categories });
    return { message: 'Categories seeded successfully', count: categories.length };
  }
}
