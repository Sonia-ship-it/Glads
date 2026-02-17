import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from '../common/dto/service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post(':branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new service', description: 'Create a new service (spa, gym, etc.) in a branch. Admin only.' })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Param('branchId') branchId: string, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(branchId, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services', description: 'Retrieve all active services, optionally filtered by branch and category' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (spa, gym, restaurant, laundry, transportation)' })
  @ApiResponse({ status: 200, description: 'Services retrieved successfully' })
  findAll(@Query('branchId') branchId?: string, @Query('category') category?: string) {
    return this.servicesService.findAll(branchId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID', description: 'Retrieve detailed information about a specific service' })
  @ApiParam({ name: 'id', description: 'Service ID', example: 'uuid-service-id' })
  @ApiResponse({ status: 200, description: 'Service retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update service', description: 'Update service details. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Service ID', example: 'uuid-service-id' })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete service', description: 'Soft delete a service. Admin only.' })
  @ApiParam({ name: 'id', description: 'Service ID', example: 'uuid-service-id' })
  @ApiResponse({ status: 200, description: 'Service deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
