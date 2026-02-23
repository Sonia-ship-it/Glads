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
  Request as RequestDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, SearchAvailableRoomsDto } from '../common/dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post(':branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Create a new room in a specific branch. Admin only.',
  })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(
    @Param('branchId') branchId: string,
    @Body() createRoomDto: CreateRoomDto,
    @RequestDecorator() req: Request,
  ) {
    return this.roomsService.create(branchId, createRoomDto, req.user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all rooms',
    description: 'Retrieve all active rooms, optionally filtered by branch',
  })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  findAll(@Query('branchId') branchId?: string, @RequestDecorator() req?: Request) {
    return this.roomsService.findAll(branchId, req?.user);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search available rooms',
    description:
      'Search for available rooms based on criteria like dates, price range, room type, occupancy',
  })
  @ApiResponse({ status: 200, description: 'Available rooms retrieved successfully' })
  searchAvailable(@Query() searchDto: SearchAvailableRoomsDto) {
    return this.roomsService.searchAvailable(searchDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get room by ID',
    description: 'Retrieve detailed information about a specific room',
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'uuid-room-id' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Get(':branchId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get room statistics',
    description: 'Get room statistics for a branch (total, occupied, by type)',
  })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiResponse({ status: 200, description: 'Room statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRoomStats(@Param('branchId') branchId: string, @RequestDecorator() req: Request) {
    return this.roomsService.getRoomStats(branchId, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update room', description: 'Update room details. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'uuid-room-id' })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @RequestDecorator() req: Request,
  ) {
    return this.roomsService.update(id, updateRoomDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete room',
    description: 'Soft delete a room (set status to inactive). Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Room ID', example: 'uuid-room-id' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  remove(@Param('id') id: string, @RequestDecorator() req: Request) {
    return this.roomsService.remove(id, req.user);
  }
}
