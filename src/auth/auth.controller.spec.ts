import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { generateLoginDtoMock } from './mocks/login.dto.mock';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authServiceMock = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authServiceMock).toBeDefined();
  });

  describe('<Login />', () => {
    it('should realize login', async () => {
      const loginResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      jest.spyOn(authServiceMock, 'login').mockResolvedValue(loginResponse);

      const result = await controller.login(generateLoginDtoMock());
      expect(authServiceMock.login).toHaveBeenCalledWith(
        generateLoginDtoMock(),
      );

      expect(result).toEqual(loginResponse);
      expect(result).toMatchSnapshot();
    });
    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      jest
        .spyOn(authServiceMock, 'login')
        .mockRejectedValue(new UnauthorizedException());
      await expect(controller.login(generateLoginDtoMock())).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should throw an ForbiddenException if user is not active', async () => {
      jest
        .spyOn(authServiceMock, 'login')
        .mockRejectedValue(new ForbiddenException());
      await expect(controller.login(generateLoginDtoMock())).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('<RefreshToken />', () => {
    it('should generate a new access token with a valid refresh token', async () => {
      const accessToken = { accessToken: 'new-access-token' };
      const refreshToken = { refreshToken: 'refresh-token' };
      jest
        .spyOn(authServiceMock, 'refreshToken')
        .mockResolvedValue(accessToken);

      const result = await controller.refreshToken(refreshToken);
      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(accessToken);
      expect(result).toMatchSnapshot();
    });

    it('should throw an ForbiddenException if refresh token is expitred', async () => {
      jest
        .spyOn(authServiceMock, 'refreshToken')
        .mockRejectedValue(new ForbiddenException());
      await expect(
        controller.refreshToken({ refreshToken: 'refresh-token' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
