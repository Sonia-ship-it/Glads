import { Branch, ServiceBooking, ServiceRevenue, BranchRevenue } from '../types';

export const DUMMY_BOOKINGS = [
    { id: '1', branch: Branch.NDERA, amount: 550, customer: 'John Doe', status: 'Paid' },
    { id: '2', branch: Branch.NDERA, amount: 850, customer: 'Jane Smith', status: 'Pending' },
    { id: '3', branch: Branch.KANOMBE, amount: 1400, customer: 'Alice Wong', status: 'Paid' },
    { id: '4', branch: Branch.KABEZA, amount: 650, customer: 'Bob Marley', status: 'Confirmed' },
    { id: '5', branch: Branch.NDERA, amount: 1200, customer: 'Emma Davis', status: 'Confirmed' },
    { id: '6', branch: Branch.KANOMBE, amount: 750, customer: 'Michael Chen', status: 'Paid' },
    { id: '7', branch: Branch.KABEZA, amount: 920, customer: 'Sarah Johnson', status: 'Pending' },
];

export const DUMMY_SERVICE_BOOKINGS: ServiceBooking[] = [
    { id: 'SB001', branchId: Branch.NDERA, serviceId: 'pool', serviceName: 'Infinity Swimming Pool', customerName: 'David Miller', customerEmail: 'david@email.com', customerPhone: '+250788123456', date: '2024-02-15', time: '10:00 AM', amount: 50, status: 'confirmed', notes: 'VIP guest', createdAt: '2024-02-10' },
    { id: 'SB002', branchId: Branch.NDERA, serviceId: 'gym', serviceName: 'Fitness Center', customerName: 'Lisa Anderson', customerEmail: 'lisa@email.com', customerPhone: '+250788234567', date: '2024-02-16', time: '6:00 AM', amount: 30, status: 'completed', createdAt: '2024-02-11' },
    { id: 'SB003', branchId: Branch.KANOMBE, serviceId: 'restaurant', serviceName: 'Fine Dining Restaurant', customerName: 'James Wilson', customerEmail: 'james@email.com', customerPhone: '+250788345678', date: '2024-02-17', time: '7:00 PM', amount: 120, status: 'pending', createdAt: '2024-02-12' },
    { id: 'SB004', branchId: Branch.NDERA, serviceId: 'spa', serviceName: 'Luxury Spa', customerName: 'Maria Garcia', customerEmail: 'maria@email.com', customerPhone: '+250788456789', date: '2024-02-18', time: '2:00 PM', amount: 150, status: 'confirmed', createdAt: '2024-02-13' },
    { id: 'SB005', branchId: Branch.KANOMBE, serviceId: 'meeting', serviceName: 'Conference Rooms', customerName: 'Robert Brown', customerEmail: 'robert@email.com', customerPhone: '+250788567890', date: '2024-02-19', time: '9:00 AM', amount: 200, status: 'confirmed', createdAt: '2024-02-14' },
    { id: 'SB006', branchId: Branch.NDERA, serviceId: 'bar', serviceName: 'Rooftop Bar', customerName: 'Emily Taylor', customerEmail: 'emily@email.com', customerPhone: '+250788678901', date: '2024-02-20', time: '8:00 PM', amount: 80, status: 'pending', createdAt: '2024-02-15' },
    { id: 'SB007', branchId: Branch.KANOMBE, serviceId: 'laundry', serviceName: 'Laundry Service', customerName: 'Chris Martin', customerEmail: 'chris@email.com', customerPhone: '+250788789012', date: '2024-02-21', time: '11:00 AM', amount: 25, status: 'completed', createdAt: '2024-02-16' },
];

export const DUMMY_SERVICE_REVENUE: ServiceRevenue[] = [
    { serviceId: 'pool', serviceName: 'Infinity Swimming Pool', totalBookings: 145, totalRevenue: 7250, branchRevenue: { [Branch.NDERA]: 4500, [Branch.KANOMBE]: 2750, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 92 },
    { serviceId: 'spa', serviceName: 'Luxury Spa', totalBookings: 98, totalRevenue: 14700, branchRevenue: { [Branch.NDERA]: 9800, [Branch.KANOMBE]: 4900, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 88 },
    { serviceId: 'restaurant', serviceName: 'Fine Dining Restaurant', totalBookings: 312, totalRevenue: 37440, branchRevenue: { [Branch.NDERA]: 22000, [Branch.KANOMBE]: 15440, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 95 },
    { serviceId: 'gym', serviceName: 'Fitness Center', totalBookings: 234, totalRevenue: 7020, branchRevenue: { [Branch.NDERA]: 4200, [Branch.KANOMBE]: 2820, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 78 },
    { serviceId: 'meeting', serviceName: 'Conference Rooms', totalBookings: 67, totalRevenue: 13400, branchRevenue: { [Branch.NDERA]: 8000, [Branch.KANOMBE]: 5400, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 71 },
    { serviceId: 'bar', serviceName: 'Rooftop Bar', totalBookings: 189, totalRevenue: 15120, branchRevenue: { [Branch.NDERA]: 9500, [Branch.KANOMBE]: 5620, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 85 },
];

export const DUMMY_BRANCH_REVENUE: BranchRevenue[] = [
    { branchId: Branch.NDERA, roomRevenue: 45000, serviceRevenue: 58000, totalRevenue: 103000, bookingCount: 287, occupancyRate: 94, averageBookingValue: 359 },
    { branchId: Branch.KANOMBE, roomRevenue: 38000, serviceRevenue: 37430, totalRevenue: 75430, bookingCount: 198, occupancyRate: 87, averageBookingValue: 381 },
    { branchId: Branch.KABEZA, roomRevenue: 28000, serviceRevenue: 0, totalRevenue: 28000, bookingCount: 124, occupancyRate: 76, averageBookingValue: 226 },
];
