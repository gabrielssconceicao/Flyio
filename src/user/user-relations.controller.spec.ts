import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRelationsController } from './user-relations.controller';
import { UserRelationsService } from './user-relations.service';
import jwtConfig from '../auth/config/jwt.config';
import { jwtServiceMock, jwtConfigurationMock } from '../auth/mocks';

describe('UserRelationsController', () => {
  let controller: UserRelationsController;
  let service: UserRelationsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRelationsController],
      providers: [
        {
          provide: UserRelationsService,
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

    controller = module.get<UserRelationsController>(UserRelationsController);
    service = module.get<UserRelationsService>(UserRelationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('<Reactivate />', () => {
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
    it('should thow an UnauthorizedException if token is invalid or expired', async () => {
      const reactivateUserDto = {
        token: 'expired-token',
      };
      jest
        .spyOn(service, 'reactivate')
        .mockRejectedValue(new UnauthorizedException());
      await expect(controller.reactivate(reactivateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
