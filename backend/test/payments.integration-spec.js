"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('Payments Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let testBranchId;
    let testRoomId;
    let testBookingId;
    let testPaymentId;
    let secondaryPaymentId;
    let testUserId;
    const timestamp = Date.now();
    const testEmail = `payments-test-${timestamp}@glads.test`;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        supabase = moduleFixture.get(supabase_service_1.SupabaseService);
        const { data: authData, error: createUserError } = await supabase
            .getAdminClient()
            .auth.admin.createUser({
            email: testEmail,
            password: 'TestPass123!',
            email_confirm: true,
        });
        if (createUserError || !authData.user) {
            throw new Error(`Failed to create test user: ${createUserError?.message}`);
        }
        testUserId = authData.user.id;
        const { data: { session }, error: signInError, } = await supabase.getClient().auth.signInWithPassword({
            email: testEmail,
            password: 'TestPass123!',
        });
        if (signInError || !session?.access_token) {
            throw new Error(`Failed to sign in test user: ${signInError?.message}`);
        }
        authToken = session.access_token;
        await supabase.getAdminClient().from('users').insert({
            id: testUserId,
            email: testEmail,
            full_name: 'Payments Test Admin',
            role: 'super-admin',
            is_active: true,
        });
        const { data: branch, error: branchError } = await supabase
            .getAdminClient()
            .from('branches')
            .insert({
            name: 'Test Branch for Payments',
            code: `TEST-PAY-${timestamp}`,
            address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
            coordinates: { latitude: -1.9441, longitude: 30.1367 },
            contact_info: { phone: '+250788000003', email: 'payments@test.rw' },
            settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
        })
            .select()
            .single();
        if (branchError || !branch) {
            throw new Error(`Failed to create test branch: ${branchError?.message}`);
        }
        testBranchId = branch.id;
        const { data: room, error: roomError } = await supabase
            .getAdminClient()
            .from('rooms')
            .insert({
            branch_id: testBranchId,
            room_number: `3${timestamp.toString().slice(-3)}`,
            floor: 3,
            room_type: 'standard',
            name: 'Test Room 301',
            base_price: 100000,
            max_occupancy: 2,
            status: 'available',
            is_active: true,
        })
            .select()
            .single();
        if (roomError || !room) {
            throw new Error(`Failed to create test room: ${roomError?.message}`);
        }
        testRoomId = room.id;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkOut = new Date(tomorrow);
        checkOut.setDate(checkOut.getDate() + 2);
        const { data: booking, error: bookingError } = await supabase
            .getAdminClient()
            .from('bookings')
            .insert({
            booking_reference: `TEST-PAY-${timestamp}`,
            branch_id: testBranchId,
            room_id: testRoomId,
            guest_info: {
                firstName: 'Test',
                lastName: 'Guest',
                email: 'guest@test.com',
                phone: '+250788999999',
            },
            check_in_date: tomorrow.toISOString(),
            check_out_date: checkOut.toISOString(),
            number_of_guests: 2,
            number_of_nights: 2,
            room_rate: 100000,
            total_amount: 200000,
            payment_status: 'pending',
            payment_gateway: 'pesapal',
            status: 'confirmed',
            source: 'website',
        })
            .select()
            .single();
        if (bookingError || !booking) {
            throw new Error(`Failed to create test booking: ${bookingError?.message}`);
        }
        testBookingId = booking.id;
        const { data: payment, error: paymentError } = await supabase
            .getAdminClient()
            .from('payments')
            .insert({
            transaction_id: `TXN-PRIMARY-${timestamp}`,
            booking_id: testBookingId,
            amount: 200000,
            currency: 'RWF',
            payment_gateway: 'pesapal',
            payment_method: 'card',
            status: 'completed',
            metadata: { cardBrand: 'Visa', last4: '4242' },
        })
            .select()
            .single();
        if (paymentError || !payment) {
            throw new Error(`Failed to create test payment: ${paymentError?.message}`);
        }
        testPaymentId = payment.id;
        const { data: payment2, error: payment2Error } = await supabase
            .getAdminClient()
            .from('payments')
            .insert({
            transaction_id: `TXN-SECONDARY-${timestamp}`,
            booking_id: testBookingId,
            amount: 50000,
            currency: 'RWF',
            payment_gateway: 'pay-at-property',
            status: 'pending',
            metadata: {},
        })
            .select()
            .single();
        if (payment2Error || !payment2) {
            throw new Error(`Failed to create secondary payment: ${payment2Error?.message}`);
        }
        secondaryPaymentId = payment2.id;
    });
    afterAll(async () => {
        if (testPaymentId) {
            await supabase.getAdminClient().from('payments').delete().eq('id', testPaymentId);
        }
        if (secondaryPaymentId) {
            await supabase.getAdminClient().from('payments').delete().eq('id', secondaryPaymentId);
        }
        if (testBookingId) {
            await supabase.getAdminClient().from('bookings').delete().eq('id', testBookingId);
        }
        if (testRoomId) {
            await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
        }
        if (testBranchId) {
            await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
        }
        await supabase.getAdminClient().from('users').delete().eq('email', testEmail);
        if (testUserId) {
            await supabase.getAdminClient().auth.admin.deleteUser(testUserId);
        }
        await app.close();
    });
    describe('GET /payments', () => {
        it('should return list of payments for staff', async () => {
            const response = await request(app.getHttpServer())
                .get('/payments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((payment) => payment.id === testPaymentId)).toBe(true);
        });
        it('should filter payments by status', async () => {
            const response = await request(app.getHttpServer())
                .get('/payments?status=completed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((payment) => {
                expect(payment.status).toBe('completed');
            });
        });
    });
    describe('POST /payments/initiate', () => {
        it('should initiate payment or return gateway error', async () => {
            const response = await request(app.getHttpServer()).post('/payments/initiate').send({
                bookingId: testBookingId,
                amount: 200000,
                currency: 'RWF',
                customerEmail: 'guest@test.com',
                customerPhone: '+250788999999',
                customerName: 'Test Guest',
                description: 'Booking payment',
            });
            expect([201, 400]).toContain(response.status);
            if (response.status === 201) {
                expect(response.body).toHaveProperty('paymentId');
                expect(response.body).toHaveProperty('transactionId');
            }
        });
    });
    describe('GET /payments/:id', () => {
        it('should return payment details', async () => {
            const response = await request(app.getHttpServer())
                .get(`/payments/${testPaymentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.id).toBe(testPaymentId);
            expect(response.body).toHaveProperty('transaction_id');
            expect(response.body).toHaveProperty('amount');
        });
    });
    describe('POST /payments/verify', () => {
        it('should return payment verification details', async () => {
            const response = await request(app.getHttpServer())
                .post('/payments/verify')
                .send({
                paymentId: testPaymentId,
                pesapalTransactionId: 'PSP-TEST-12345',
            })
                .expect(201);
            expect(response.body.id).toBe(testPaymentId);
            expect(response.body.status).toBe('completed');
        });
    });
    describe('POST /payments/:id/refund', () => {
        it('should process refund for completed payment', async () => {
            const response = await request(app.getHttpServer())
                .post(`/payments/${testPaymentId}/refund`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ refundAmount: 150000 })
                .expect(201);
            expect(response.body.paymentId).toBe(testPaymentId);
            expect(response.body.status).toBe('refunded');
        });
    });
    describe('POST /payments/callback', () => {
        it('should reject invalid callback payload', async () => {
            await request(app.getHttpServer()).post('/payments/callback').send({}).expect(400);
        });
    });
});
//# sourceMappingURL=payments.integration-spec.js.map