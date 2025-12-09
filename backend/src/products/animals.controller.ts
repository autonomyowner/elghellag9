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
import { AnimalsService } from './animals.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new animal listing' })
  async create(@CurrentUser() user: { userId: string }, @Body() data: any) {
    return this.animalsService.create(user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all animal listings with filters' })
  async findAll(@Query() query: any) {
    return this.animalsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured animal listings' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.animalsService.getFeatured(limit);
  }

  @Get('my-listings')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user animal listings' })
  async getMyListings(@CurrentUser() user: { userId: string }) {
    return this.animalsService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get animal listing by ID' })
  async findOne(@Param('id') id: string) {
    return this.animalsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update animal listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() data: any,
  ) {
    return this.animalsService.update(id, user.userId, data);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete animal listing' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.animalsService.remove(id, user.userId);
  }
}
