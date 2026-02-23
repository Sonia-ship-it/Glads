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
import { CreateContactMessageDto, UpdateContactMessageDto } from '../common/dto/contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit contact message', description: 'Public endpoint to submit inquiries/messages.' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 201, description: 'Contact message submitted successfully' })
  create(@Body() createDto: CreateContactMessageDto) {
    return this.contactService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get contact messages', description: 'Staff/Admin endpoint to list contact messages.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by message status' })
  @ApiResponse({ status: 200, description: 'Contact messages retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('branchId') branchId?: string, @Query('status') status?: string) {
    return this.contactService.findAll(branchId, status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get contact message by ID' })
  @ApiParam({ name: 'id', description: 'Contact message ID', example: 'uuid-contact-id' })
  @ApiResponse({ status: 200, description: 'Contact message retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contact message not found' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update contact message', description: 'Update status/assignment/response. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Contact message ID', example: 'uuid-contact-id' })
  @ApiBody({ type: UpdateContactMessageDto })
  @ApiResponse({ status: 200, description: 'Contact message updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contact message not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateContactMessageDto) {
    return this.contactService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete contact message', description: 'Soft delete contact message. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Contact message ID', example: 'uuid-contact-id' })
  @ApiResponse({ status: 200, description: 'Contact message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
