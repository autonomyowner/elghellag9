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
import { VegetablesService } from './vegetables.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Vegetables')
@Controller('vegetables')
export class VegetablesController {
  constructor(private readonly vegetablesService: VegetablesService) {}

  @Post()
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new vegetable listing' })
  async create(@CurrentUser() user: { userId: string }, @Body() data: any) {
    return this.vegetablesService.create(user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vegetable listings with filters' })
  async findAll(@Query() query: any) {
    return this.vegetablesService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured vegetable listings' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.vegetablesService.getFeatured(limit);
  }

  @Get('my-listings')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user vegetable listings' })
  async getMyListings(@CurrentUser() user: { userId: string }) {
    return this.vegetablesService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vegetable listing by ID' })
  async findOne(@Param('id') id: string) {
    return this.vegetablesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vegetable listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() data: any,
  ) {
    return this.vegetablesService.update(id, user.userId, data);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete vegetable listing' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.vegetablesService.remove(id, user.userId);
  }
}
