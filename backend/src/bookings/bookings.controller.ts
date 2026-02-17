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
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CheckAvailabilityDto,
  OtaManualBookingDto,
} from '../common/dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a booking',
    description: 'Create a new booking for a guest. Public endpoint.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Room not available or invalid data' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Post('ota')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create OTA manual booking',
    description: 'Manually create a booking from OTA platform. Staff/Admin only.',
  })
  @ApiBody({ type: OtaManualBookingDto })
  @ApiResponse({ status: 201, description: 'OTA booking created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createOtaBooking(@Body() otaBookingDto: OtaManualBookingDto) {
    return this.bookingsService.createOtaManualBooking(otaBookingDto);
  }

  @Post('check-availability')
  @ApiOperation({
    summary: 'Check room availability',
    description: 'Check if a room is available for specific dates',
  })
  @ApiBody({ type: CheckAvailabilityDto })
  @ApiResponse({ status: 200, description: 'Availability checked successfully' })
  checkAvailability(@Body() checkDto: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(checkDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieve all bookings, optionally filtered by branch and status. Staff/Admin only.',
  })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('branchId') branchId?: string, @Query('status') status?: string) {
    return this.bookingsService.findAll(branchId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID', description: 'Retrieve detailed booking information' })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get('branch/:branchId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get booking statistics',
    description: 'Get booking statistics for a branch (total, revenue, status breakdown)',
  })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getBookingStats(
    @Param('branchId') branchId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingsService.getBookingStats(branchId, startDate, endDate);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update booking',
    description: 'Update booking details. Staff/Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'uuid-booking-id' })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Post(':id/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check-in booking',
    description: 'Mark booking as checked-in and update room status. Staff/Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Check-in successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  checkIn(@Param('id') id: string) {
    return this.bookingsService.checkIn(id);
  }

  @Post(':id/check-out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check-out booking',
    description: 'Mark booking as checked-out and free up room. Staff/Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Check-out successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  checkOut(@Param('id') id: string) {
    return this.bookingsService.checkOut(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel a booking. Staff/Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Booking ID', example: 'uuid-booking-id' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
