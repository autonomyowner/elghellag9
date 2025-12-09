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
import { LandService } from './land.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { QueryLandDto } from './dto/query-land.dto';

@ApiTags('Land')
@Controller('land')
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Post()
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new land listing' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() data: CreateLandDto,
  ) {
    return this.landService.create(user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all land listings with filters' })
  async findAll(@Query() query: QueryLandDto) {
    return this.landService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured land listings' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.landService.getFeatured(limit);
  }

  @Get('my-listings')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user land listings' })
  async getMyListings(@CurrentUser() user: { userId: string }) {
    return this.landService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get land listing by ID' })
  async findOne(@Param('id') id: string) {
    return this.landService.findOne(id);
  }

  @Put(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update land listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() data: UpdateLandDto,
  ) {
    return this.landService.update(id, user.userId, data);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete land listing' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.landService.remove(id, user.userId);
  }
}
