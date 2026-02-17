import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: SupabaseService;

  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
    getAdminClient: jest.fn(() => mockSupabaseClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@glads.com',
        full_name: 'Test User',
        role: 'staff',
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await service.getCurrentUser(userId);

      expect(result).toEqual(mockUser);
      expect(mockChain.select).toHaveBeenCalledWith('*, branches(name, code)');
      expect(mockChain.eq).toHaveBeenCalledWith('id', userId);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const userId = 'non-existent';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(service.getCurrentUser(userId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if valid', async () => {
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@glads.com',
        full_name: 'Test User',
        role: 'staff',
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent';

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'User not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await service.validateUser(userId);

      expect(result).toBeNull();
    });
  });
});
