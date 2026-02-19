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
import { RoomAvailabilityService } from './room-availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateRoomAvailabilityDto,
  UpdateRoomAvailabilityDto,
  BulkUpdateRoomAvailabilityDto,
  QueryRoomAvailabilityDto,
} from '../common/dto/room-availability.dto';

@ApiTags('Room Availability')
@Controller('room-availability')
export class RoomAvailabilityController {
  constructor(private readonly service: RoomAvailabilityService) {}

  @Post('branch/:branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create room availability entry (Staff only)' })
  create(
    @Param('branchId') branchId: string,
    @Body() createDto: CreateRoomAvailabilityDto,
  ) {
    return this.service.create(branchId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get room availability by date range' })
  findByDateRange(@Query() queryDto: QueryRoomAvailabilityDto) {
    return this.service.findByDateRange(queryDto);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get availability for specific room' })
  findByRoom(
    @Param('roomId') roomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.findByRoom(roomId, startDate, endDate);
  }

  @Put('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update room availability (Staff only)' })
  bulkUpdate(@Body() bulkDto: BulkUpdateRoomAvailabilityDto) {
    return this.service.bulkUpdate(bulkDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update room availability (Staff only)' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRoomAvailabilityDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete room availability entry (Staff only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
