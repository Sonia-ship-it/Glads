import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
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
import { ServiceBookingsService } from './service-bookings.service';
import { CreateServiceBookingDto } from '../common/dto/service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Service Bookings')
@Controller('service-bookings')
export class ServiceBookingsController {
  constructor(private readonly serviceBookingsService: ServiceBookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create service booking', description: 'Book a service (spa, gym subscription, etc.)' })
  @ApiBody({ type: CreateServiceBookingDto })
  @ApiResponse({ status: 201, description: 'Service booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createDto: CreateServiceBookingDto) {
    return this.serviceBookingsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all service bookings', description: 'Retrieve service bookings with filters. Staff/Admin only.' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Service bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('userId') userId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: string,
  ) {
    return this.serviceBookingsService.findAll(userId, serviceId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service booking by ID', description: 'Retrieve detailed service booking information' })
  @ApiParam({ name: 'id', description: 'Service booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Service booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service booking not found' })
  findOne(@Param('id') id: string) {
    return this.serviceBookingsService.findOne(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete service booking', description: 'Mark service booking as completed. Staff only.' })
  @ApiParam({ name: 'id', description: 'Service booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Service booking completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service booking not found' })
  complete(@Param('id') id: string) {
    return this.serviceBookingsService.complete(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel service booking', description: 'Cancel a service booking. Staff/User only.' })
  @ApiParam({ name: 'id', description: 'Service booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Service booking cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service booking not found' })
  cancel(@Param('id') id: string) {
    return this.serviceBookingsService.cancel(id);
  }
}
