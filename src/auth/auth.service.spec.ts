/* eslint-disable @typescript-eslint/unbound-method */
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const authPayload: AuthPayloadDto = {
      username: 'testuser',
      password: 'password123',
    };
    const adminData = {
      id: 1,
      username: 'testuser',
      password: 'password123',
    };

    it('should return a JWT token for valid credentials', async () => {
      const expectedToken = 'jwt-token-123';
      jest
        .spyOn(prismaService.admin, 'findUnique')
        .mockResolvedValue(adminData);
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      const result = await service.validateUser(authPayload);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: adminData.id,
        username: adminData.username,
      });
      expect(result).toBe(expectedToken);
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(prismaService.admin, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser(authPayload);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const invalidPayload: AuthPayloadDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      jest
        .spyOn(prismaService.admin, 'findUnique')
        .mockResolvedValue(adminData);

      const result = await service.validateUser(invalidPayload);

      expect(prismaService.admin.findUnique).toHaveBeenCalledWith({
        where: { username: invalidPayload.username },
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
