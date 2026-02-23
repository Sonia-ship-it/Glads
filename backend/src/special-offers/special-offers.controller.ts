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
import { CreateSpecialOfferDto, UpdateSpecialOfferDto } from '../common/dto/special-offer.dto';
import { SpecialOffersService } from './special-offers.service';

@ApiTags('Special Offers')
@Controller('special-offers')
export class SpecialOffersController {
  constructor(private readonly specialOffersService: SpecialOffersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create special offer', description: 'Create a new special offer. Staff/Admin only.' })
  @ApiBody({ type: CreateSpecialOfferDto })
  @ApiResponse({ status: 201, description: 'Special offer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateSpecialOfferDto) {
    return this.specialOffersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get special offers', description: 'Get special offers, optionally filtered by branch/featured/active state.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'featured', required: false, description: 'Filter by featured flag (true/false)' })
  @ApiQuery({ name: 'activeOnly', required: false, description: 'Only return active offers (true/false), default true' })
  @ApiResponse({ status: 200, description: 'Special offers retrieved successfully' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('featured') featured?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const parsedFeatured = featured === undefined ? undefined : featured === 'true';
    const parsedActiveOnly = activeOnly === undefined ? true : activeOnly === 'true';
    return this.specialOffersService.findAll(branchId, parsedFeatured, parsedActiveOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get special offer by ID' })
  @ApiParam({ name: 'id', description: 'Special offer ID', example: 'uuid-special-offer-id' })
  @ApiResponse({ status: 200, description: 'Special offer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Special offer not found' })
  findOne(@Param('id') id: string) {
    return this.specialOffersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update special offer', description: 'Update special offer details. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Special offer ID', example: 'uuid-special-offer-id' })
  @ApiBody({ type: UpdateSpecialOfferDto })
  @ApiResponse({ status: 200, description: 'Special offer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Special offer not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSpecialOfferDto) {
    return this.specialOffersService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete special offer', description: 'Soft delete special offer. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Special offer ID', example: 'uuid-special-offer-id' })
  @ApiResponse({ status: 200, description: 'Special offer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.specialOffersService.remove(id);
  }
}
