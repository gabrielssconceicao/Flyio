import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { jwtServiceMock, jwtConfigurationMock } from 'src/auth/mocks';

import { ReactivateUserService } from '../../reactivate-user.service';
import { ReactivateUserController } from 'src/user/reactivate-user.controller';

describe('UserController', () => {
  let controller: ReactivateUserController;
  let service: ReactivateUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactivateUserController],
      providers: [
        {
          provide: ReactivateUserService,
          useValue: {
            reactivate: jest.fn(),
          },
        },

        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfigurationMock,
        },
      ],
    }).compile();

    controller = module.get<ReactivateUserController>(ReactivateUserController);
    service = module.get<ReactivateUserService>(ReactivateUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should reactivate a user successfully', async () => {
    const reactivateUserDto = {
      token: 'token',
    };
    const message = 'User reactivated successfully';
    jest.spyOn(service, 'reactivate').mockResolvedValue({ message });
    const result = await controller.reactivate(reactivateUserDto);
    expect(service.reactivate).toHaveBeenCalledWith(reactivateUserDto);
    expect(result).toEqual({ message });
    expect(result).toMatchSnapshot();
  });
});
