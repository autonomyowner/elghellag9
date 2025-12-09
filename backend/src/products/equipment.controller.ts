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
import { EquipmentService } from './equipment.service';
import { ClerkGuard } from '../auth/guards/clerk.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';

@ApiTags('Equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new equipment listing' })
  async create(
    @CurrentUser() user: { userId: string },
    @Body() data: CreateEquipmentDto,
  ) {
    return this.equipmentService.create(user.userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all equipment listings with filters' })
  async findAll(@Query() query: QueryEquipmentDto) {
    return this.equipmentService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured equipment listings' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.equipmentService.getFeatured(limit);
  }

  @Get('my-listings')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user equipment listings' })
  async getMyListings(@CurrentUser() user: { userId: string }) {
    return this.equipmentService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  async findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Put(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update equipment listing' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() data: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, user.userId, data);
  }

  @Delete(':id')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete equipment listing' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.equipmentService.remove(id, user.userId);
  }
}
