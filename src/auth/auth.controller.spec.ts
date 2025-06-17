/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { AuthPayloadDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(), // Mock do método validateUser
          },
        },
      ],
    })
      .overrideGuard(LocalGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock do LocalGuard
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should return an access token for valid credentials', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'test',
        password: 'password',
      };
      const mockToken = 'jwt-token-123';

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockToken);

      const result = await controller.login(authPayload);

      expect(authService.validateUser).toHaveBeenCalledWith(authPayload);
      expect(result).toEqual({ access_token: mockToken });
    });

    it('should propagate error from AuthService for invalid credentials', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'invalid',
        password: 'wrong',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(authPayload)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.validateUser).toHaveBeenCalledWith(authPayload);
    });

    it('should apply LocalGuard to login endpoint', () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        AuthController.prototype.login,
      );
      expect(guards).toContain(LocalGuard);
    });
  });
});
