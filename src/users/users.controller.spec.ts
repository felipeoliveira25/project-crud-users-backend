/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock do JwtAuthGuard
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /users', () => {
    it('should create a user and return the result', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: '5000',
      };
      const createdUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: '5000',
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should apply JwtAuthGuard to create endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.create,
      );
      expect(guards).toContain(JwtAuthGuard);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          telephone: '123456789',
          role: 'USER',
          age: 30,
          salary: '5000',
        },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should apply JwtAuthGuard to findAll endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.findAll,
      );
      expect(guards).toContain(JwtAuthGuard);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const userId = 1;
      const user = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: '5000',
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne(userId);

      expect(usersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('should apply JwtAuthGuard to findOne endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.findOne,
      );
      expect(guards).toContain(JwtAuthGuard);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user and return the result', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
        telephone: '987654321',
        role: 'ADMIN',
        age: 35,
        salary: '6000',
      };
      const updatedUser = {
        id: userId,
        name: 'Updated User',
        email: 'updated@example.com',
        telephone: '987654321',
        role: 'ADMIN',
        age: 35,
        salary: '6000',
      };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should apply JwtAuthGuard to update endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.update,
      );
      expect(guards).toContain(JwtAuthGuard);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should remove a user and return the result', async () => {
      const userId = 1;
      const deletedUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
        role: 'USER',
        age: 30,
        salary: '5000',
      };

      jest.spyOn(usersService, 'remove').mockResolvedValue(deletedUser);

      const result = await controller.remove(userId);

      expect(usersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(deletedUser);
    });

    it('should apply JwtAuthGuard to remove endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        UsersController.prototype.remove,
      );
      expect(guards).toContain(JwtAuthGuard);
    });
  });
});
