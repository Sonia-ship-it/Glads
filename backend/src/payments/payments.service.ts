import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InitiatePaymentDto, VerifyPaymentDto } from '../common/dto/payment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly pesapalBaseUrl: string;
  private readonly pesapalConsumerKey: string;
  private readonly pesapalConsumerSecret: string;
  private readonly pesapalIpnUrl: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {
    this.pesapalBaseUrl = 'https://pay.pesapal.com/v3'; // Production URL, use sandbox for dev
    this.pesapalConsumerKey = this.configService.get<string>('PESAPAL_CONSUMER_KEY');
    this.pesapalConsumerSecret = this.configService.get<string>('PESAPAL_CONSUMER_SECRET');
    this.pesapalIpnUrl = this.configService.get<string>('PESAPAL_IPN_URL');
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${randomUUID().slice(0, 8)}`;
  }

  private async getPesapalAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.pesapalBaseUrl}/api/Auth/RequestToken`, {
        consumer_key: this.pesapalConsumerKey,
        consumer_secret: this.pesapalConsumerSecret,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status === '200') {
        return response.data.token;
      } else {
        throw new Error('Failed to get Pesapal auth token');
      }
    } catch (error) {
      throw new BadRequestException(`Pesapal authentication failed: ${error.message}`);
    }
  }

  async initiatePayment(initiateDto: InitiatePaymentDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Create payment record first
    const { data: paymentRecord, error } = await supabase
      .from('payments')
      .insert({
        transaction_id: this.generateTransactionId(),
        booking_id: initiateDto.bookingId,
        service_booking_id: initiateDto.serviceBookingId,
        amount: initiateDto.amount,
        currency: initiateDto.currency || 'RWF',
        payment_gateway: 'pesapal',
        status: 'pending',
        metadata: {
          customerEmail: initiateDto.customerEmail,
          customerPhone: initiateDto.customerPhone,
          description: initiateDto.description,
        },
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create payment record: ${error.message}`);
    }

    try {
      // Get auth token from Pesapal
      const authToken = await this.getPesapalAuthToken();

      // Prepare payment request
      const paymentPayload = {
        id: paymentRecord.transaction_id,
        currency: initiateDto.currency || 'RWF',
        amount: initiateDto.amount,
        description: initiateDto.description || 'Hotel booking payment',
        callback_url: `${this.configService.get('API_BASE_URL') || 'http://localhost:3001/api'}/payments/callback`,
        notification_id: await this.registerIPN(authToken),
        billing_address: {
          email_address: initiateDto.customerEmail,
          phone_number: initiateDto.customerPhone,
          country_code: 'RW',
          first_name: initiateDto.customerName?.split(' ')[0] || 'Guest',
          last_name: initiateDto.customerName?.split(' ').slice(1).join(' ') || '',
        },
      };

      // Submit order request to Pesapal
      const response = await axios.post(
        `${this.pesapalBaseUrl}/api/Transactions/SubmitOrderRequest`,
        paymentPayload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === '200') {
        // Update payment record with Pesapal details
        await supabase
          .from('payments')
          .update({
            pesapal_transaction_id: response.data.order_tracking_id,
            metadata: {
              ...paymentRecord.metadata,
              pesapalOrderTrackingId: response.data.order_tracking_id,
              redirectUrl: response.data.redirect_url,
            },
          })
          .eq('id', paymentRecord.id);

        return {
          paymentId: paymentRecord.id,
          transactionId: paymentRecord.transaction_id,
          pesapalOrderTrackingId: response.data.order_tracking_id,
          redirectUrl: response.data.redirect_url,
          status: 'initiated',
          message: 'Payment initiated successfully. Redirect user to payment gateway.',
        };
      } else {
        throw new Error(`Pesapal order submission failed: ${response.data.error}`);
      }
    } catch (error) {
      // Update payment record with error
      await supabase
        .from('payments')
        .update({ status: 'failed', metadata: { ...paymentRecord.metadata, error: error.message } })
        .eq('id', paymentRecord.id);

      throw new BadRequestException(`Payment initiation failed: ${error.message}`);
    }
  }

  private async registerIPN(authToken: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.pesapalBaseUrl}/api/URLSetup/RegisterIPN`,
        {
          url: this.pesapalIpnUrl,
          ipn_notification_type: 'GET',
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === '200') {
        return response.data.ipn_id;
      } else {
        throw new Error('Failed to register IPN');
      }
    } catch (error) {
      throw new BadRequestException(`IPN registration failed: ${error.message}`);
    }
  }

  async handleCallback(callbackData: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { OrderTrackingId, OrderMerchantReference } = callbackData;
    
    // Find payment by transaction ID or Pesapal tracking ID
    let query = supabase.from('payments').select('*, bookings(*), service_bookings(*)');
    
    if (OrderMerchantReference) {
      query = query.eq('transaction_id', OrderMerchantReference);
    } else if (OrderTrackingId) {
      query = query.eq('pesapal_transaction_id', OrderTrackingId);
    } else {
      throw new BadRequestException('Invalid callback data');
    }

    const { data: payment, error } = await query.single();

    if (error || !payment) {
      throw new BadRequestException('Payment record not found');
    }

    // Verify payment status with Pesapal
    const paymentStatus = await this.verifyPaymentWithPesapal(OrderTrackingId);
    const normalizedStatus = paymentStatus.payment_status_description?.toLowerCase?.() || 'pending';
    const finalStatus = normalizedStatus.includes('complete')
      ? 'completed'
      : normalizedStatus.includes('fail')
        ? 'failed'
        : 'pending';
    
    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: finalStatus,
        payment_method: paymentStatus.payment_method,
        metadata: {
          ...payment.metadata,
          pesapalResponse: paymentStatus,
          callbackData,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      throw new BadRequestException(`Failed to update payment: ${updateError.message}`);
    }

    // Update related booking status if payment is successful
    if (finalStatus === 'completed') {
      if (payment.booking_id) {
        await supabase
          .from('bookings')
          .update({ 
            payment_status: 'paid',
            pesapal_payment_method: paymentStatus.payment_method,
            pesapal_transaction_id: OrderTrackingId,
          })
          .eq('id', payment.booking_id);
      }
      
      if (payment.service_booking_id) {
        await supabase
          .from('service_bookings')
          .update({ 
            payment_status: 'paid',
            pesapal_payment_method: paymentStatus.payment_method,
            pesapal_transaction_id: OrderTrackingId,
          })
          .eq('id', payment.service_booking_id);
      }
    }

    return {
      paymentId: payment.id,
      transactionId: payment.transaction_id,
      status: paymentStatus.payment_status_description,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: paymentStatus.payment_method,
      updatedAt: new Date().toISOString(),
    };
  }

  private async verifyPaymentWithPesapal(orderTrackingId: string) {
    try {
      const authToken = await this.getPesapalAuthToken();
      
      const response = await axios.get(
        `${this.pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === '200') {
        return {
          payment_status_description: response.data.payment_status_description,
          payment_method: response.data.payment_method,
          amount: response.data.amount,
          currency: response.data.currency,
          message: response.data.message,
        };
      } else {
        throw new Error('Failed to verify payment status');
      }
    } catch (error) {
      throw new BadRequestException(`Payment verification failed: ${error.message}`);
    }
  }

  async verifyPayment(verifyDto: VerifyPaymentDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*, bookings(*), service_bookings(*)')
      .eq('id', verifyDto.paymentId)
      .single();

    if (error) {
      throw new BadRequestException(`Payment not found: ${error.message}`);
    }

    // If payment is still pending, verify with Pesapal
    if (data.status === 'pending' && data.pesapal_transaction_id) {
      try {
        const pesapalStatus = await this.verifyPaymentWithPesapal(data.pesapal_transaction_id);
        
        // Update payment record if status changed
        if (pesapalStatus.payment_status_description.toLowerCase() !== data.status) {
          await supabase
            .from('payments')
            .update({
              status: pesapalStatus.payment_status_description.toLowerCase(),
              payment_method: pesapalStatus.payment_method,
              metadata: {
                ...data.metadata,
                latestPesapalVerification: pesapalStatus,
              },
            })
            .eq('id', data.id);
          
          data.status = pesapalStatus.payment_status_description.toLowerCase();
          data.payment_method = pesapalStatus.payment_method;
        }
      } catch (verificationError) {
        // Log error but don't fail the request
        console.error('Pesapal verification error:', verificationError.message);
      }
    }

    return data;
  }

  async processRefund(paymentId: string, refundAmount?: number) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Can only refund completed payments');
    }

    const refundAmountToProcess = refundAmount || payment.amount;
    
    if (refundAmountToProcess > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed original payment amount');
    }

    // Note: Pesapal v3 API doesn't have direct refund endpoint
    // This would typically be handled manually or through their merchant portal
    // For now, we'll mark the payment as refunded in our system
    
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refundAmount: refundAmountToProcess,
          refundedAt: new Date().toISOString(),
          refundNote: 'Manual refund processed',
        },
      })
      .eq('id', paymentId);

    if (updateError) {
      throw new BadRequestException(`Failed to update refund status: ${updateError.message}`);
    }

    return {
      paymentId,
      originalAmount: payment.amount,
      refundAmount: refundAmountToProcess,
      status: 'refunded',
      note: 'Refund marked in system. Manual processing may be required through Pesapal merchant portal.',
    };
  }

  async findAll(bookingId?: string, serviceBookingId?: string, status?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from('payments')
      .select('*, bookings(booking_reference, guest_info, total_amount), service_bookings(booking_reference, guest_info, total_amount)');

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }
    
    if (serviceBookingId) {
      query = query.eq('service_booking_id', serviceBookingId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Failed to fetch payments: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('payments')
      .select('*, bookings(booking_reference, guest_info, total_amount, check_in_date, check_out_date), service_bookings(booking_reference, guest_info, total_amount, service_date)')
      .eq('id', id)
      .single();

    if (error) {
      throw new BadRequestException(`Payment not found: ${error.message}`);
    }
    
    return data;
  }
}
