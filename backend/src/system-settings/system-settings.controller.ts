import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateSystemSettingDto,
  UpdateSystemSettingDto,
} from '../common/dto/system-setting.dto';

@ApiTags('System Settings')
@Controller('system-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly service: SystemSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create system setting (Super Admin only)' })
  create(@Body() createDto: CreateSystemSettingDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all system settings (Admin only)' })
  findAll() {
    return this.service.findAll();
  }

  @Get('as-object')
  @ApiOperation({ summary: 'Get all settings as key-value object' })
  getAsObject() {
    return this.service.getSettingsAsObject();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get system setting by key' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update system setting (Super Admin only)' })
  update(@Param('key') key: string, @Body() updateDto: UpdateSystemSettingDto) {
    return this.service.update(key, updateDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete system setting (Super Admin only)' })
  remove(@Param('key') key: string) {
    return this.service.remove(key);
  }
}
