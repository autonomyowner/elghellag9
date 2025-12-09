import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  id: string;
  type: 'equipment' | 'land' | 'animal' | 'vegetable' | 'nursery';
  title: string;
  description: string | null;
  price: number;
  currency: string;
  location: string;
  images: string[];
  createdAt: Date;
  user: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, filters?: {
    type?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ items: SearchResult[]; total: number; pagination: any }> {
    const { type, location, minPrice, maxPrice, page = 1, limit = 20 } = filters || {};

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];
    let total = 0;

    // Build common where clause
    const buildWhere = (additionalWhere: any = {}) => ({
      isAvailable: true,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { location: { contains: searchTerm, mode: 'insensitive' as const } },
      ],
      ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...additionalWhere,
    });

    const userSelect = {
      select: { id: true, fullName: true, avatarUrl: true, isVerified: true },
    };

    // Search Equipment
    if (!type || type === 'equipment') {
      const equipment = await this.prisma.equipment.findMany({
        where: buildWhere(),
        include: { user: userSelect, category: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      const equipmentCount = await this.prisma.equipment.count({ where: buildWhere() });

      results.push(...equipment.map(item => ({
        id: item.id,
        type: 'equipment' as const,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        location: item.location,
        images: item.images,
        createdAt: item.createdAt,
        user: item.user,
        category: item.category,
      })));
      total += equipmentCount;
    }

    // Search Land
    if (!type || type === 'land') {
      const land = await this.prisma.landListing.findMany({
        where: buildWhere(),
        include: { user: userSelect },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      const landCount = await this.prisma.landListing.count({ where: buildWhere() });

      results.push(...land.map(item => ({
        id: item.id,
        type: 'land' as const,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        location: item.location,
        images: item.images,
        createdAt: item.createdAt,
        user: item.user,
        areaSize: item.areaSize,
        areaUnit: item.areaUnit,
        listingType: item.listingType,
      })));
      total += landCount;
    }

    // Search Animals
    if (!type || type === 'animal') {
      const animals = await this.prisma.animalListing.findMany({
        where: buildWhere(),
        include: { user: userSelect },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      const animalsCount = await this.prisma.animalListing.count({ where: buildWhere() });

      results.push(...animals.map(item => ({
        id: item.id,
        type: 'animal' as const,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        location: item.location,
        images: item.images,
        createdAt: item.createdAt,
        user: item.user,
        animalType: item.animalType,
        quantity: item.quantity,
      })));
      total += animalsCount;
    }

    // Search Vegetables
    if (!type || type === 'vegetable') {
      const vegetables = await this.prisma.vegetable.findMany({
        where: buildWhere(),
        include: { user: userSelect },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      const vegetablesCount = await this.prisma.vegetable.count({ where: buildWhere() });

      results.push(...vegetables.map(item => ({
        id: item.id,
        type: 'vegetable' as const,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        location: item.location,
        images: item.images,
        createdAt: item.createdAt,
        user: item.user,
        vegetableType: item.vegetableType,
        organic: item.organic,
      })));
      total += vegetablesCount;
    }

    // Search Nurseries
    if (!type || type === 'nursery') {
      const nurseries = await this.prisma.nursery.findMany({
        where: buildWhere(),
        include: { user: userSelect },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      const nurseriesCount = await this.prisma.nursery.count({ where: buildWhere() });

      results.push(...nurseries.map(item => ({
        id: item.id,
        type: 'nursery' as const,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        location: item.location,
        images: item.images,
        createdAt: item.createdAt,
        user: item.user,
      })));
      total += nurseriesCount;
    }

    // Sort combined results by date
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate combined results
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedResults,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSuggestions(query: string): Promise<string[]> {
    const searchTerm = query.toLowerCase();
    const suggestions: Set<string> = new Set();

    // Get suggestions from equipment titles
    const equipment = await this.prisma.equipment.findMany({
      where: {
        title: { contains: searchTerm, mode: 'insensitive' },
        isAvailable: true,
      },
      select: { title: true },
      take: 5,
    });
    equipment.forEach(e => suggestions.add(e.title));

    // Get suggestions from land titles
    const land = await this.prisma.landListing.findMany({
      where: {
        title: { contains: searchTerm, mode: 'insensitive' },
        isAvailable: true,
      },
      select: { title: true },
      take: 5,
    });
    land.forEach(l => suggestions.add(l.title));

    // Get suggestions from animals
    const animals = await this.prisma.animalListing.findMany({
      where: {
        title: { contains: searchTerm, mode: 'insensitive' },
        isAvailable: true,
      },
      select: { title: true },
      take: 5,
    });
    animals.forEach(a => suggestions.add(a.title));

    return Array.from(suggestions).slice(0, 10);
  }

  async getLocations(): Promise<string[]> {
    const locations: Set<string> = new Set();

    const equipment = await this.prisma.equipment.findMany({
      where: { isAvailable: true },
      select: { location: true },
      distinct: ['location'],
    });
    equipment.forEach(e => locations.add(e.location));

    const land = await this.prisma.landListing.findMany({
      where: { isAvailable: true },
      select: { location: true },
      distinct: ['location'],
    });
    land.forEach(l => locations.add(l.location));

    return Array.from(locations).sort();
  }
}
