import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NurseriesService } from './nurseries.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Nurseries')
@Controller('nurseries')
export class NurseriesController {
  constructor(private readonly nurseriesService: NurseriesService) {}

  @Post()
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new nursery listing' })
  async create(@CurrentUser() user: { userId: string }, @Body() data: any) {
    return this.nurseriesService.create(user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all nursery listings with filters' })
  async findAll(@Query() query: any) {
    return this.nurseriesService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured nursery listings' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.nurseriesService.getFeatured(limit);
  }

  @Get('my-listings')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user nursery listings' })
  async getMyListings(@CurrentUser() user: { userId: string }) {
    return this.nurseriesService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get nursery listing by ID' })
  async findOne(@Param('id') id: string) {
    return this.nurseriesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update nursery listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() data: any,
  ) {
    return this.nurseriesService.update(id, user.userId, data);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete nursery listing' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.nurseriesService.remove(id, user.userId);
  }
}
