import { JwtService } from '@nestjs/jwt';
import { AuthTokenGuard } from './auth-token.guard';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { jwtServiceMock } from '../mocks/jwt.service.mock';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtConfigurationMock } from '../mocks/jwt.configuration.mock';
describe('<AuthTokenGuard />', () => {
  let authTokenGuard: AuthTokenGuard;
  let jwtService: JwtService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;
  let mockExecutionContext: Partial<ExecutionContext>;
  beforeEach(() => {
    jwtService = jwtServiceMock as unknown as JwtService;
    jwtConfiguration = jwtConfigurationMock;
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    };
    authTokenGuard = new AuthTokenGuard(jwtService, jwtConfiguration);
  });
  it('should be defined', () => {
    expect(authTokenGuard).toBeDefined();
  });

  it('should allow access with a valid token', async () => {
    const mockPayload = { sub: '1', username: 'John Doe' };
    jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);
    const result = await authTokenGuard.canActivate(
      mockExecutionContext as ExecutionContext,
    );
    expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
      secret: jwtConfiguration.secret,
      audience: jwtConfiguration.audience,
      issuer: jwtConfiguration.issuer,
    });
    expect(result).toBe(true);
    expect(result).toMatchSnapshot();
  });

  it('should throw an UnauthorizedException if token is missing', async () => {
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: 'Bearer',
          },
        }),
      }),
    };

    await expect(
      authTokenGuard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw an TokenExpiredError with an expired token', async () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw { name: 'TokenExpiredError' };
    });

    await expect(
      authTokenGuard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(
      authTokenGuard.canActivate(mockExecutionContext as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });
});
