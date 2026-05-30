import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from '../common/dto/menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Menu')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Post(':branchId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a new menu for a branch' })
  @ApiResponse({ status: 201, description: 'Menu uploaded successfully' })
  async createMenu(@Param('branchId') branchId: string, @Body() createDto: CreateMenuDto) {
    createDto.branchId = branchId;
    return this.menuService.createMenu(createDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get all menus (optionally filter by branch)' })
  @ApiResponse({ status: 200, description: 'List of menus' })
  async getAllMenus(@Query('branchId') branchId?: string, @Request() req?: any) {
    return this.menuService.getAllMenus(branchId, req?.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiResponse({ status: 200, description: 'Menu details' })
  async getMenuById(@Param('id') id: string) {
    return this.menuService.getMenuById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a menu' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  async updateMenu(@Param('id') id: string, @Body() updateDto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a menu' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  async deleteMenu(@Param('id') id: string) {
    return this.menuService.deleteMenu(id);
  }
}
