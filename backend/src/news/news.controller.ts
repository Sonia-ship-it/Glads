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
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from '../common/dto/news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('News')
@Controller('news')
@UseGuards(RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('super-admin', 'super-manager', 'branch-manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create news',
    description: 'Create a new news article or update. Staff/Admin only.',
  })
  @ApiBody({ type: CreateNewsDto })
  @ApiResponse({ status: 201, description: 'News created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateNewsDto, @RequestDecorator() req: Request) {
    return this.newsService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all news', description: 'Retrieve all published news articles' })
  @ApiQuery({
    name: 'scope',
    required: false,
    description: 'Filter by scope (company-wide, branch-specific)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category (announcement, event, promotion, update)',
  })
  @ApiResponse({ status: 200, description: 'News retrieved successfully' })
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findAll(
    @Query('scope') scope?: string,
    @Query('category') category?: string,
    @RequestDecorator() req?: Request,
  ) {
    return this.newsService.findAll(scope, category, req?.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get news by ID',
    description: 'Retrieve detailed news information. View count will increment.',
  })
  @ApiParam({ name: 'id', description: 'News ID', example: 'uuid-news-id' })
  @ApiResponse({ status: 200, description: 'News retrieved successfully' })
  @ApiResponse({ status: 404, description: 'News not found' })
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('super-admin', 'super-manager', 'branch-manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update news', description: 'Update news article. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'News ID', example: 'uuid-news-id' })
  @ApiBody({ type: UpdateNewsDto })
  @ApiResponse({ status: 200, description: 'News updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'News not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNewsDto,
    @RequestDecorator() req: Request,
  ) {
    return this.newsService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('super-admin', 'super-manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete news',
    description: 'Soft delete news article. Super Admin/Manager only.',
  })
  @ApiParam({ name: 'id', description: 'News ID', example: 'uuid-news-id' })
  @ApiResponse({ status: 200, description: 'News deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @RequestDecorator() req: Request) {
    return this.newsService.remove(id, req.user);
  }
}
