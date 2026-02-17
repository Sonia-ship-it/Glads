import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, VerifyPaymentDto, PaymentCallbackDto } from '../common/dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment', description: 'Initiate payment via Pesapal gateway' })
  @ApiBody({ type: InitiatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully. Returns redirect URL.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  initiatePayment(@Body() initiateDto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(initiateDto);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Payment callback', description: 'Handle payment gateway callback (IPN). Called by Pesapal.' })
  @ApiBody({ type: PaymentCallbackDto })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  handleCallback(@Body() callbackData: PaymentCallbackDto) {
    return this.paymentsService.handleCallback(callbackData);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment', description: 'Verify payment status with payment gateway' })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({ status: 200, description: 'Payment verification result' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  verifyPayment(@Body() verifyDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payments', description: 'Retrieve payment records. Staff/Admin only.' })
  @ApiQuery({ name: 'bookingId', required: false, description: 'Filter by room booking ID' })
  @ApiQuery({ name: 'serviceBookingId', required: false, description: 'Filter by service booking ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('bookingId') bookingId?: string, 
    @Query('serviceBookingId') serviceBookingId?: string,
    @Query('status') status?: string
  ) {
    return this.paymentsService.findAll(bookingId, serviceBookingId, status);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process refund', description: 'Process payment refund. Admin only.' })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refundAmount: {
          type: 'number',
          description: 'Partial refund amount (optional, defaults to full amount)',
          example: 150.0
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  processRefund(@Param('id') id: string, @Body() body: { refundAmount?: number }) {
    return this.paymentsService.processRefund(id, body.refundAmount);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by ID', description: 'Retrieve detailed payment information. Staff/Admin only.' })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
