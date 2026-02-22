import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GetRevenueReportDto, ExportReportDto } from '../common/dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getRevenueReport(reportDto: GetRevenueReportDto) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('payments')
      .select('amount, currency, created_at, booking_id, bookings(branch_id, branches(name))')
      .eq('status', 'completed')
      .gte('created_at', reportDto.startDate)
      .lte('created_at', reportDto.endDate);

    if (reportDto.branchId) {
      query = query.eq('bookings.branch_id', reportDto.branchId);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch revenue report: ${error.message}`);

    // Calculate totals
    const totalRevenue = data.reduce((sum, payment) => sum + payment.amount, 0);
    const transactionCount = data.length;
    const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Group by date
    const dailyRevenue = data.reduce((acc, payment) => {
      const date = payment.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + payment.amount;
      return acc;
    }, {});

    return {
      period: {
        start: reportDto.startDate,
        end: reportDto.endDate,
      },
      summary: {
        totalRevenue,
        transactionCount,
        averageTransaction,
        currency: data[0]?.currency || 'RWF',
      },
      dailyRevenue,
      transactions: data,
    };
  }

  async getOccupancyReport(branchId?: string, startDate?: string, endDate?: string) {
    // Delegate to the main implementation
    return this.getDetailedOccupancyReport({
      startDate:
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      branchId,
    });
  }

  async getServiceReport(branchId?: string, startDate?: string, endDate?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('service_bookings')
      .select(
        'id, total_amount, status, service_date, service_id, services(name, category, branch_id, branches(name))',
      )
      .in('status', ['confirmed', 'completed']);

    if (startDate) {
      query = query.gte('service_date', startDate);
    }
    if (endDate) {
      query = query.lte('service_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch service report: ${error.message}`);

    // Filter by branch if needed
    const filteredData = branchId
      ? data.filter((sb) => {
          const service = Array.isArray(sb.services) ? sb.services[0] : sb.services;
          return service && service.branch_id === branchId;
        })
      : data;

    const totalRevenue = filteredData.reduce((sum, sb) => sum + (sb.total_amount || 0), 0);
    const byCategory = filteredData.reduce((acc, sb) => {
      const service = Array.isArray(sb.services) ? sb.services[0] : sb.services;
      const category = (service && service.category) || 'other';
      acc[category] = (acc[category] || 0) + (sb.total_amount || 0);
      return acc;
    }, {});

    return {
      totalServiceBookings: filteredData.length,
      totalServiceRevenue: totalRevenue,
      revenueByCategory: byCategory,
    };
  }

  async getDetailedOccupancyReport(reportDto: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }) {
    const supabase = this.supabaseService.getAdminClient();

    // Get room availability data
    let roomQuery = supabase
      .from('room_availability')
      .select('*, rooms!inner(branch_id)')
      .gte('date', reportDto.startDate)
      .lte('date', reportDto.endDate);

    if (reportDto.branchId) {
      roomQuery = roomQuery.eq('rooms.branch_id', reportDto.branchId);
    }

    const { data: availabilityData, error: availabilityError } = await roomQuery;
    if (availabilityError)
      throw new Error(`Failed to fetch occupancy data: ${availabilityError.message}`);

    // Calculate occupancy metrics
    const totalAvailableNights = availabilityData?.length || 0;
    const occupiedNights = availabilityData?.filter((a) => !a.is_available).length || 0;
    const averageOccupancy =
      totalAvailableNights > 0 ? (occupiedNights / totalAvailableNights) * 100 : 0;

    // Group by date
    const dailyOccupancy = (availabilityData || []).reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { total: 0, occupied: 0 };
      }
      acc[date].total += 1;
      if (!item.is_available) {
        acc[date].occupied += 1;
      }
      return acc;
    }, {});

    // Convert to percentage
    const dailyOccupancyRate = Object.fromEntries(
      Object.entries(dailyOccupancy).map(([date, data]: [string, any]) => [
        date,
        data.total > 0 ? Math.round((data.occupied / data.total) * 100 * 100) / 100 : 0,
      ]),
    );

    return {
      startDate: reportDto.startDate,
      endDate: reportDto.endDate,
      averageOccupancy: Math.round(averageOccupancy * 100) / 100,
      totalAvailableNights,
      totalNightsBooked: occupiedNights,
      dailyOccupancy: dailyOccupancyRate,
    };
  }

  async getBookingStatistics(reportDto: { startDate: string; endDate: string; branchId?: string }) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('bookings')
      .select('*')
      .gte('created_at', reportDto.startDate)
      .lte('created_at', reportDto.endDate);

    if (reportDto.branchId) {
      query = query.eq('branch_id', reportDto.branchId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch booking statistics: ${error.message}`);

    const bookings = data || [];
    const totalBookings = bookings.length;
    const averageStayDuration = this.calculateAverageStay(bookings);
    const statusBreakdown = this.groupByStatus(bookings);

    // Find most popular room type
    const roomTypeCount = bookings.reduce((acc, booking) => {
      // This would need to be joined with rooms table in a real implementation
      const roomType = 'standard'; // Placeholder
      acc[roomType] = (acc[roomType] || 0) + 1;
      return acc;
    }, {});

    const popularRoomType = Object.entries(roomTypeCount).sort(
      ([, a], [, b]) => (b as number) - (a as number),
    )[0]?.[0];

    return {
      startDate: reportDto.startDate,
      endDate: reportDto.endDate,
      totalBookings,
      averageStayDuration: Math.round(averageStayDuration * 100) / 100,
      statusBreakdown,
      popularRoomType,
    };
  }

  async exportReport(exportDto: ExportReportDto): Promise<Buffer> {
    // Get the data for the report
    let reportData: any;

    switch (exportDto.reportType) {
      case 'revenue':
        reportData = await this.getRevenueReport({
          startDate: exportDto.startDate,
          endDate: exportDto.endDate,
          branchId: exportDto.branchId,
        });
        break;
      case 'occupancy':
        reportData = await this.getDetailedOccupancyReport({
          startDate: exportDto.startDate,
          endDate: exportDto.endDate,
          branchId: exportDto.branchId,
        });
        break;
      case 'bookings':
        reportData = await this.getBookingStatistics({
          startDate: exportDto.startDate,
          endDate: exportDto.endDate,
          branchId: exportDto.branchId,
        });
        break;
      default:
        throw new Error(`Unsupported report type: ${exportDto.reportType}`);
    }

    if (exportDto.format === 'pdf') {
      return await this.generatePDFReport(reportData, exportDto);
    } else if (exportDto.format === 'excel') {
      return await this.generateExcelReport(reportData, exportDto);
    } else {
      throw new Error(`Unsupported export format: ${exportDto.format}`);
    }
  }

  private async generatePDFReport(data: any, exportDto: ExportReportDto): Promise<Buffer> {
    // Simple PDF generation using basic HTML to PDF conversion
    // In production, you might want to use more sophisticated libraries like puppeteer
    const htmlContent = this.generateHTMLReport(data, exportDto);

    // For now, return HTML as buffer - in production implement actual PDF generation
    // You would typically use: puppeteer, PDFKit, or jsPDF server-side
    return Buffer.from(htmlContent, 'utf8');
  }

  private async generateExcelReport(data: any, exportDto: ExportReportDto): Promise<Buffer> {
    // Simple Excel generation
    // In production, use libraries like 'exceljs' or 'node-xlsx'

    let worksheetData: any[][] = [];
    const fileName = `${exportDto.reportType}-report`;

    switch (exportDto.reportType) {
      case 'revenue':
        worksheetData = this.prepareRevenueDataForExcel(data);
        break;
      case 'occupancy':
        worksheetData = this.prepareOccupancyDataForExcel(data);
        break;
      case 'bookings':
        worksheetData = this.prepareBookingDataForExcel(data);
        break;
    }

    // Create simple CSV format as Excel alternative (in production use actual Excel library)
    const csvContent = worksheetData
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\\n');

    return Buffer.from(csvContent, 'utf8');
  }

  private generateHTMLReport(data: any, exportDto: ExportReportDto): string {
    const title = `${exportDto.reportType.toUpperCase()} Report`;
    const dateRange = `${exportDto.startDate} to ${exportDto.endDate}`;

    let content = '';

    switch (exportDto.reportType) {
      case 'revenue':
        content = this.generateRevenueHTMLContent(data);
        break;
      case 'occupancy':
        content = this.generateOccupancyHTMLContent(data);
        break;
      case 'bookings':
        content = this.generateBookingHTMLContent(data);
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .summary { background-color: #f9f9f9; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p><strong>Report Period:</strong> ${dateRange}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        ${content}
      </body>
      </html>
    `;
  }

  private generateRevenueHTMLContent(data: any): string {
    return `
      <div class="summary">
        <h2>Revenue Summary</h2>
        <p><strong>Total Revenue:</strong> ${data.summary.currency} ${data.summary.totalRevenue.toLocaleString()}</p>
        <p><strong>Transaction Count:</strong> ${data.summary.transactionCount}</p>
        <p><strong>Average Transaction:</strong> ${data.summary.currency} ${data.summary.averageTransaction.toFixed(2)}</p>
      </div>
      
      <h2>Daily Revenue Breakdown</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Revenue (${data.summary.currency})</th></tr>
        </thead>
        <tbody>
          ${Object.entries(data.dailyRevenue)
            .map(
              ([date, revenue]) =>
                `<tr><td>${date}</td><td>${(revenue as number).toLocaleString()}</td></tr>`,
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  private generateOccupancyHTMLContent(data: any): string {
    return `
      <div class="summary">
        <h2>Occupancy Summary</h2>
        <p><strong>Average Occupancy Rate:</strong> ${data.averageOccupancy}%</p>
        <p><strong>Total Nights Booked:</strong> ${data.totalNightsBooked}</p>
        <p><strong>Total Available Nights:</strong> ${data.totalAvailableNights}</p>
      </div>
      
      <h2>Daily Occupancy</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Occupancy Rate (%)</th><th>Rooms Occupied</th></tr>
        </thead>
        <tbody>
          ${Object.entries(data.dailyOccupancy || {})
            .map(([date, rate]) => `<tr><td>${date}</td><td>${rate}%</td><td>-</td></tr>`)
            .join('')}
        </tbody>
      </table>
    `;
  }

  private generateBookingHTMLContent(data: any): string {
    return `
      <div class="summary">
        <h2>Booking Statistics</h2>
        <p><strong>Total Bookings:</strong> ${data.totalBookings}</p>
        <p><strong>Average Stay Duration:</strong> ${data.averageStayDuration} nights</p>
        <p><strong>Most Popular Room Type:</strong> ${data.popularRoomType || 'N/A'}</p>
      </div>
      
      <h2>Booking Status Distribution</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Count</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          ${Object.entries(data.statusBreakdown || {})
            .map(([status, count]) => {
              const percentage =
                data.totalBookings > 0
                  ? (((count as number) / data.totalBookings) * 100).toFixed(1)
                  : '0';
              return `<tr><td>${status}</td><td>${count}</td><td>${percentage}%</td></tr>`;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }

  private prepareRevenueDataForExcel(data: any): any[][] {
    const headers = ['Date', `Revenue (${data.summary.currency})`];
    const rows = Object.entries(data.dailyRevenue).map(([date, revenue]) => [date, revenue]);

    return [
      ['Revenue Report'],
      [`Period: ${data.period.start} to ${data.period.end}`],
      [],
      [`Total Revenue: ${data.summary.totalRevenue}`],
      [`Transaction Count: ${data.summary.transactionCount}`],
      [`Average Transaction: ${data.summary.averageTransaction}`],
      [],
      headers,
      ...rows,
    ];
  }

  private prepareOccupancyDataForExcel(data: any): any[][] {
    const headers = ['Date', 'Occupancy Rate (%)', 'Rooms Occupied'];
    const rows = Object.entries(data.dailyOccupancy || {}).map(([date, rate]) => [date, rate, '-']);

    return [
      ['Occupancy Report'],
      [`Period: ${data.startDate} to ${data.endDate}`],
      [],
      [`Average Occupancy: ${data.averageOccupancy}%`],
      [`Total Nights Booked: ${data.totalNightsBooked}`],
      [],
      headers,
      ...rows,
    ];
  }

  private prepareBookingDataForExcel(data: any): any[][] {
    const headers = ['Status', 'Count', 'Percentage'];
    const rows = Object.entries(data.statusBreakdown || {}).map(([status, count]) => {
      const percentage =
        data.totalBookings > 0 ? (((count as number) / data.totalBookings) * 100).toFixed(1) : '0';
      return [status, count, `${percentage}%`];
    });

    return [
      ['Booking Statistics Report'],
      [`Period: ${data.startDate} to ${data.endDate}`],
      [],
      [`Total Bookings: ${data.totalBookings}`],
      [`Average Stay Duration: ${data.averageStayDuration} nights`],
      [],
      headers,
      ...rows,
    ];
  }

  private calculateAverageStay(bookings: any[]): number {
    if (bookings.length === 0) return 0;
    const totalNights = bookings.reduce((sum, booking) => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    return totalNights / bookings.length;
  }

  private groupByStatus(data: any[]) {
    return data.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }
}
