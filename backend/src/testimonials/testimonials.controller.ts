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
import { CreateTestimonialDto, UpdateTestimonialDto } from '../common/dto/testimonial.dto';
import { TestimonialsService } from './testimonials.service';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post(':branchId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create testimonial', description: 'Create testimonial for a branch. Staff/Admin only.' })
  @ApiParam({ name: 'branchId', description: 'Branch ID', example: 'uuid-branch-id' })
  @ApiBody({ type: CreateTestimonialDto })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Param('branchId') branchId: string, @Body() createDto: CreateTestimonialDto) {
    return this.testimonialsService.create(branchId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get testimonials', description: 'Retrieve active testimonials for public display.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'featured', required: false, description: 'Filter by featured flag (true/false)' })
  @ApiResponse({ status: 200, description: 'Testimonials retrieved successfully' })
  findAll(@Query('branchId') branchId?: string, @Query('featured') featured?: string) {
    const parsedFeatured = featured === undefined ? undefined : featured === 'true';
    return this.testimonialsService.findAll(branchId, parsedFeatured);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get testimonial by ID' })
  @ApiParam({ name: 'id', description: 'Testimonial ID', example: 'uuid-testimonial-id' })
  @ApiResponse({ status: 200, description: 'Testimonial retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update testimonial', description: 'Update testimonial details. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Testimonial ID', example: 'uuid-testimonial-id' })
  @ApiBody({ type: UpdateTestimonialDto })
  @ApiResponse({ status: 200, description: 'Testimonial updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateTestimonialDto) {
    return this.testimonialsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete testimonial', description: 'Soft delete testimonial. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Testimonial ID', example: 'uuid-testimonial-id' })
  @ApiResponse({ status: 200, description: 'Testimonial deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
