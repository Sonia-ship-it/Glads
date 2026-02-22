import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from '../common/dto/menu.dto';

describe('MenuController', () => {
  let controller: MenuController;
  let service: MenuService;

  const mockMenuService = {
    createMenu: jest.fn(),
    getAllMenus: jest.fn(),
    getMenuById: jest.fn(),
    updateMenu: jest.fn(),
    deleteMenu: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    controller = module.get<MenuController>(MenuController);
    service = module.get<MenuService>(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMenu', () => {
    it('should create a new menu for branch', async () => {
      const branchId = 'branch-123';
      const createDto: CreateMenuDto = {
        branchId,
        name: 'Breakfast Menu - March 2026',
        menuUrl: 'https://example.com/menus/breakfast.pdf',
        effectiveDate: '2026-03-01',
        description: 'New seasonal breakfast items',
      };

      const mockMenu = {
        id: 'menu-123',
        ...createDto,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      mockMenuService.createMenu.mockResolvedValue(mockMenu);

      const result = await controller.createMenu(branchId, createDto);

      expect(result).toEqual(mockMenu);
      expect(createDto.branchId).toBe(branchId);
    });
  });

  describe('getAllMenus', () => {
    it('should return all menus', async () => {
      const mockMenus = [
        { id: 'menu-1', name: 'Breakfast Menu', is_active: true },
        { id: 'menu-2', name: 'Dinner Menu', is_active: true },
      ];

      mockMenuService.getAllMenus.mockResolvedValue(mockMenus);

      const result = await controller.getAllMenus();

      expect(result).toEqual(mockMenus);
      expect(mockMenuService.getAllMenus).toHaveBeenCalled();
    });

    it('should filter menus by branch', async () => {
      const branchId = 'branch-123';
      const mockMenus = [{ id: 'menu-1', branch_id: branchId, name: 'Breakfast Menu' }];

      mockMenuService.getAllMenus.mockResolvedValue(mockMenus);

      const result = await controller.getAllMenus(branchId);

      expect(result).toEqual(mockMenus);
      expect(mockMenuService.getAllMenus).toHaveBeenCalledWith(branchId);
    });
  });

  describe('getMenuById', () => {
    it('should return a single menu', async () => {
      const menuId = 'menu-123';
      const mockMenu = {
        id: menuId,
        name: 'Breakfast Menu',
        menu_url: 'https://example.com/menu.pdf',
      };

      mockMenuService.getMenuById.mockResolvedValue(mockMenu);

      const result = await controller.getMenuById(menuId);

      expect(result).toEqual(mockMenu);
      expect(mockMenuService.getMenuById).toHaveBeenCalledWith(menuId);
    });
  });

  describe('updateMenu', () => {
    it('should update a menu', async () => {
      const menuId = 'menu-123';
      const updateDto: UpdateMenuDto = {
        name: 'Updated Menu Name',
        isActive: false,
      };

      const mockUpdatedMenu = {
        id: menuId,
        name: 'Updated Menu Name',
        is_active: false,
      };

      mockMenuService.updateMenu.mockResolvedValue(mockUpdatedMenu);

      const result = await controller.updateMenu(menuId, updateDto);

      expect(result).toEqual(mockUpdatedMenu);
      expect(mockMenuService.updateMenu).toHaveBeenCalledWith(menuId, updateDto);
    });
  });

  describe('deleteMenu', () => {
    it('should delete a menu', async () => {
      const menuId = 'menu-123';
      const mockResponse = { message: 'Menu deleted successfully' };

      mockMenuService.deleteMenu.mockResolvedValue(mockResponse);

      const result = await controller.deleteMenu(menuId);

      expect(result).toEqual(mockResponse);
      expect(mockMenuService.deleteMenu).toHaveBeenCalledWith(menuId);
    });
  });
});
