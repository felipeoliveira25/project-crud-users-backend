/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let cacheManager: any;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(60),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and invalidate users_list cache', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: 5000,
      };
      const createdUser = { id: 1, ...createUserDto };

      jest.spyOn(prismaService.users, 'create').mockResolvedValue(createdUser);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      const result = await service.create(createUserDto);

      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(cacheManager.del).toHaveBeenCalledWith('users_list');
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return users from cache if available', async () => {
      const cachedUsers = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          telephone: '123456789',
          role: 'USER',
          age: 30,
          salary: 5000,
        },
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedUsers);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('users_list');
      expect(prismaService.users.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(cachedUsers);
    });

    it('should fetch users from database and cache them if not in cache', async () => {
      const users = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          telephone: '123456789',
          role: 'USER',
          age: 30,
          salary: 5000,
        },
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.users, 'findMany').mockResolvedValue(users);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.findAll();

      expect(cacheManager.get).toHaveBeenCalledWith('users_list');
      expect(prismaService.users.findMany).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith('CACHE_TTL', 60);
      expect(cacheManager.set).toHaveBeenCalledWith('users_list', users, 60);
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return user from cache if available', async () => {
      const userId = 1;
      const cachedUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: 5000,
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedUser);

      const result = await service.findOne(userId);

      expect(cacheManager.get).toHaveBeenCalledWith(`user_${userId}`);
      expect(prismaService.users.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(cachedUser);
    });

    it('should fetch user from database and cache it if not in cache', async () => {
      const userId = 1;
      const user = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: 5000,
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(user);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.findOne(userId);

      expect(cacheManager.get).toHaveBeenCalledWith(`user_${userId}`);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(configService.get).toHaveBeenCalledWith('CACHE_TTL', 60);
      expect(cacheManager.set).toHaveBeenCalledWith(`user_${userId}`, user, 60);
      expect(result).toEqual(user);
    });

    it('should return null if user is not found', async () => {
      const userId = 999;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);

      const result = await service.findOne(userId);

      expect(cacheManager.get).toHaveBeenCalledWith(`user_${userId}`);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user and invalidate caches', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };
      const updatedUser = {
        id: userId,
        name: 'Updated User',
        email: 'updated@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: 5000,
      };

      jest.spyOn(prismaService.users, 'update').mockResolvedValue(updatedUser);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      const result = await service.update(userId, updateUserDto);

      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
      expect(cacheManager.del).toHaveBeenCalledWith('users_list');
      expect(cacheManager.del).toHaveBeenCalledWith(`user_${userId}`);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user and invalidate caches', async () => {
      const userId = 1;
      const deletedUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: 5000,
      };

      jest.spyOn(prismaService.users, 'delete').mockResolvedValue(deletedUser);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      const result = await service.remove(userId);

      expect(prismaService.users.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(cacheManager.del).toHaveBeenCalledWith('users_list');
      expect(cacheManager.del).toHaveBeenCalledWith(`user_${userId}`);
      expect(result).toEqual(deletedUser);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 999;

      jest
        .spyOn(prismaService.users, 'delete')
        .mockRejectedValue(new Error('Record to delete does not exist'));

      await expect(service.remove(userId)).rejects.toThrow(
        'Usuário não encontrado',
      );
      expect(prismaService.users.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(cacheManager.del).not.toHaveBeenCalled();
    });
  });
});
