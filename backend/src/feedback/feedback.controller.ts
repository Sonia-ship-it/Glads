import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateFeedbackDto, UpdateFeedbackDto } from '../common/dto/feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  @ApiOperation({ summary: 'Submit feedback', description: 'Public endpoint to submit guest feedback.' })
  @ApiBody({ type: CreateFeedbackDto })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  create(@Body() createDto: CreateFeedbackDto) {
    return this.feedbackService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feedback list', description: 'Staff/Admin endpoint to retrieve feedback records.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by feedback status' })
  @ApiResponse({ status: 200, description: 'Feedback records retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Request() req?: any
  ) {
    return this.feedbackService.findAll(branchId, category, status, req?.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback ID', example: 'uuid-feedback-id' })
  @ApiResponse({ status: 200, description: 'Feedback record retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update feedback', description: 'Update feedback status/response. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Feedback ID', example: 'uuid-feedback-id' })
  @ApiBody({ type: UpdateFeedbackDto })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFeedbackDto) {
    return this.feedbackService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete feedback', description: 'Soft delete feedback. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Feedback ID', example: 'uuid-feedback-id' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
