import { Test, TestingModule } from '@nestjs/testing';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

describe('BranchesController', () => {
  let controller: BranchesController;
  let service: BranchesService;

  const mockBranchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getBranchStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BranchesController],
      providers: [
        {
          provide: BranchesService,
          useValue: mockBranchesService,
        },
      ],
    }).compile();

    controller = module.get<BranchesController>(BranchesController);
    service = module.get<BranchesService>(BranchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBranch', () => {
    it('should create a new branch', async () => {
      const createDto: CreateBranchDto = {
        name: 'Main Branch - Nairobi',
        code: 'NRB01',
        address: {
          street: 'Westlands Road',
          city: 'Nairobi',
          state: 'Nairobi County',
          zipCode: '00100',
          country: 'Kenya',
        },
        coordinates: {
          latitude: -1.2921,
          longitude: 36.8219,
        },
        contactInfo: {
          phone: '+254712345678',
          email: 'nairobi@glads.com',
        },
        amenities: ['WiFi', 'Parking'],
        description: 'Main branch in Nairobi',
        settings: {
          currency: 'KES',
          timezone: 'Africa/Nairobi',
          taxRate: 0.16,
          serviceChargeRate: 0.10,
        },
      };

      const mockBranch = {
        id: 'branch-123',
        ...createDto,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      mockBranchesService.create.mockResolvedValue(mockBranch);

      const result = await controller.createBranch(createDto);

      expect(result).toEqual(mockBranch);
      expect(mockBranchesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getAllBranches', () => {
    it('should return all branches', async () => {
      const mockBranches = [
        {
          id: 'branch-1',
          name: 'Nairobi Branch',
          location: 'Westlands',
          is_active: true,
        },
        {
          id: 'branch-2',
          name: 'Mombasa Branch',
          location: 'Nyali',
          is_active: true,
        },
      ];

      mockBranchesService.findAll.mockResolvedValue(mockBranches);

      const result = await controller.getAllBranches();

      expect(result).toEqual(mockBranches);
      expect(mockBranchesService.findAll).toHaveBeenCalled();
    });
  });

  describe('getBranch', () => {
    it('should return a single branch', async () => {
      const branchId = 'branch-123';
      const mockBranch = {
        id: branchId,
        name: 'Nairobi Branch',
        location: 'Westlands',
        is_active: true,
      };

      mockBranchesService.findOne.mockResolvedValue(mockBranch);

      const result = await controller.getBranch(branchId);

      expect(result).toEqual(mockBranch);
      expect(mockBranchesService.findOne).toHaveBeenCalledWith(branchId);
    });
  });

  describe('updateBranch', () => {
    it('should update a branch', async () => {
      const branchId = 'branch-123';
      const updateDto: UpdateBranchDto = {
        name: 'Updated Nairobi Branch',
        contactInfo: {
          phone: '+254712345679',
          email: 'updated@glads.com',
        },
      };

      const mockUpdatedBranch = {
        id: branchId,
        name: 'Updated Nairobi Branch',
        location: 'Westlands',
        phone: '+254712345679',
      };

      mockBranchesService.update.mockResolvedValue(mockUpdatedBranch);

      const result = await controller.updateBranch(branchId, updateDto);

      expect(result).toEqual(mockUpdatedBranch);
      expect(mockBranchesService.update).toHaveBeenCalledWith(branchId, updateDto);
    });
  });

  describe('deleteBranch', () => {
    it('should delete a branch', async () => {
      const branchId = 'branch-123';
      const mockResponse = { message: 'Branch deleted successfully' };

      mockBranchesService.remove.mockResolvedValue(mockResponse);

      const result = await controller.deleteBranch(branchId);

      expect(result).toEqual(mockResponse);
      expect(mockBranchesService.remove).toHaveBeenCalledWith(branchId);
    });
  });

  describe('getBranchStats', () => {
    it('should call branchesService.getBranchStats with branch ID', async () => {
      const branchId = 'branch-uuid';
      const expectedStats = {
        branchId,
        rooms: { total: 10, available: 8, occupied: 2 },
        bookings: { total: 50, confirmed: 45 },
        revenue: { total: 15000, currency: 'RWF' },
      };

      jest.spyOn(mockBranchesService, 'getBranchStats').mockResolvedValue(expectedStats);

      const result = await controller.getBranchStats(branchId);

      expect(mockBranchesService.getBranchStats).toHaveBeenCalledWith(branchId);
      expect(result).toEqual(expectedStats);
    });
  });
});
