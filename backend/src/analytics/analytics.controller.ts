import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GetRevenueReportDto, ExportReportDto } from '../common/dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report', description: 'Get revenue analytics for a date range. Admin/Manager only.' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO format)', example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO format)', example: '2026-01-31' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const reportDto: GetRevenueReportDto = { startDate, endDate, branchId };
    return this.analyticsService.getRevenueReport(reportDto);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy report', description: 'Get room occupancy analytics. Admin/Manager only.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Occupancy report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getOccupancyReport(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOccupancyReport(branchId, startDate, endDate);
  }

  @Get('services')
  @ApiOperation({ summary: 'Get service report', description: 'Get service booking analytics. Admin/Manager only.' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Service report retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getServiceReport(
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getServiceReport(branchId, startDate, endDate);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export report', description: 'Export analytics report to PDF or Excel. Admin only.' })
  @ApiBody({ type: ExportReportDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Report file generated and returned',
    headers: {
      'Content-Type': {
        description: 'MIME type of the exported file',
        schema: { type: 'string' }
      },
      'Content-Disposition': {
        description: 'File download disposition',
        schema: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid export parameters' })
  async exportReport(@Body() exportDto: ExportReportDto, @Res() res: any) {
    const fileBuffer = await this.analyticsService.exportReport(exportDto);
    
    const filename = `${exportDto.reportType}-report-${new Date().toISOString().split('T')[0]}`;
    
    if (exportDto.format === 'pdf') {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      });
    } else if (exportDto.format === 'excel') {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      });
    } else {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      });
    }

    res.send(fileBuffer);
  }
}
