import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from '../common/dto/room.dto';

describe('RoomsController', () => {
  let controller: RoomsController;
  let service: RoomsService;

  const mockRoomsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    searchAvailable: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getRoomStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const branchId = 'branch-123';
      const createDto: CreateRoomDto = {
        branchId: branchId,
        roomNumber: '101',
        roomType: 'deluxe',
        floor: 1,
        name: 'Deluxe Room 101',
        description: 'Spacious deluxe room',
        basePrice: 5000,
        maxOccupancy: 2,
        sizeSqm: 35,
        bedType: 'King',
        viewType: 'City View',
        amenities: ['wifi', 'tv'],
        images: [],
      };

      const mockRoom = {
        id: 'room-123',
        branch_id: branchId,
        ...createDto,
      };

      mockRoomsService.create.mockResolvedValue(mockRoom);

      const result = await controller.create(branchId, createDto, {} as any);

      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.create).toHaveBeenCalledWith(branchId, createDto);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const mockRooms = [
        { id: 'room-1', room_number: '101', room_type: 'deluxe' },
        { id: 'room-2', room_number: '102', room_type: 'suite' },
      ];

      mockRoomsService.findAll.mockResolvedValue(mockRooms);

      const result = await controller.findAll();

      expect(result).toEqual(mockRooms);
      expect(mockRoomsService.findAll).toHaveBeenCalled();
    });
  });

  describe('searchAvailable', () => {
    it('should search available rooms with filters', async () => {
      const filters: any = {
        branchId: 'branch-123',
        checkInDate: '2026-02-20T14:00:00Z',
        checkOutDate: '2026-02-22T11:00:00Z',
        numberOfGuests: 2,
        roomType: 'deluxe',
        minPrice: 50,
        maxPrice: 200,
      };

      const mockRooms = [
        { id: 'room-1', room_number: '101', room_type: 'deluxe', base_price: 150 },
      ];

      mockRoomsService.searchAvailable.mockResolvedValue(mockRooms);

      const result = await controller.searchAvailable(filters);

      expect(result).toEqual(mockRooms);
      expect(mockRoomsService.searchAvailable).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should return a single room', async () => {
      const roomId = 'room-123';
      const mockRoom = {
        id: roomId,
        room_number: '101',
        room_type: 'deluxe',
      };

      mockRoomsService.findOne.mockResolvedValue(mockRoom);

      const result = await controller.findOne(roomId);

      expect(result).toEqual(mockRoom);
      expect(mockRoomsService.findOne).toHaveBeenCalledWith(roomId);
    });
  });

  describe('update', () => {
    it('should update a room', async () => {
      const roomId = 'room-123';
      const updateDto: UpdateRoomDto = {
        basePrice: 5500,
        status: 'active',
      };

      const mockUpdatedRoom = {
        id: roomId,
        room_number: '101',
        price_per_night: 5500,
      };

      mockRoomsService.update.mockResolvedValue(mockUpdatedRoom);

      const result = await controller.update(roomId, updateDto, {} as any);

      expect(result).toEqual(mockUpdatedRoom);
      expect(mockRoomsService.update).toHaveBeenCalledWith(roomId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a room', async () => {
      const roomId = 'room-123';
      const mockResponse = { message: 'Room deleted successfully' };

      mockRoomsService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(roomId, {} as any);

      expect(result).toEqual(mockResponse);
      expect(mockRoomsService.remove).toHaveBeenCalledWith(roomId);
    });
  });

  describe('getRoomStats', () => {
    it('should return room statistics for branch', async () => {
      const branchId = 'branch-123';
      const mockStats = {
        totalRooms: 20,
        availableRooms: 15,
        occupiedRooms: 5,
        occupancyRate: 25,
      };

      mockRoomsService.getRoomStats.mockResolvedValue(mockStats);

      const result = await controller.getRoomStats(branchId, {} as any);

      expect(result).toEqual(mockStats);
      expect(mockRoomsService.getRoomStats).toHaveBeenCalledWith(branchId);
    });
  });
});
