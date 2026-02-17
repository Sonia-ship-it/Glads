import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterStaffDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    getCurrentUser: jest.fn(),
    validateUser: jest.fn(),
    registerStaff: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('test', () => {
    it('should return auth test information', () => {
      const result = controller.test();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toBe('Auth module is working!');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockRequest = {
        user: { sub: 'user-123', email: 'test@glads.com' },
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@glads.com',
        full_name: 'Test User',
        role: 'staff',
      };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockRequest);

      expect(result).toEqual(mockUser);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('registerStaff', () => {
    it('should call authService.registerStaff with correct parameters', async () => {
      const registerDto: RegisterStaffDto = {
        email: 'admin@glads.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Admin',
        phone: '+254712345678',
        role: 'super-admin',
      };

      const mockRequest = {
        user: { sub: 'current-user-id' },
      };

      const expectedResult = {
        id: 'new-user-id',
        email: 'admin@glads.com',
        full_name: 'System Admin',
        role: 'super-admin',
        created_at: new Date(),
      };

      jest.spyOn(mockAuthService, 'registerStaff').mockResolvedValue(expectedResult);

      const result = await controller.registerStaff(mockRequest, registerDto);

      expect(mockAuthService.registerStaff).toHaveBeenCalledWith(registerDto, 'current-user-id');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile with correct parameters', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };

      const updateDto: UpdateProfileDto = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+254712345679',
      };

      const expectedResult = {
        id: 'user-123',
        full_name: 'Updated Name',
        phone: '+254712345679',
        updated_at: new Date(),
      };

      jest.spyOn(mockAuthService, 'updateProfile').mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with correct parameters', async () => {
      const mockRequest = {
        user: { sub: 'user-123' },
      };

      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      };

      const expectedResult = {
        message: 'Password changed successfully',
        updated_at: new Date().toISOString(),
      };

      jest.spyOn(mockAuthService, 'changePassword').mockResolvedValue(expectedResult);

      const result = await controller.changePassword(mockRequest, changePasswordDto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-123', changePasswordDto);
      expect(result).toEqual(expectedResult);
    });
  });
});

