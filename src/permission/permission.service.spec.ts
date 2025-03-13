import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { ForbiddenException } from '@nestjs/common';

describe('<PermissionService />', () => {
  let service: PermissionService;
  let loggedUserId: string;
  let targetUserId: string;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionService],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should verify user ownership', () => {
    loggedUserId = 'id-1';
    targetUserId = 'id-1';

    expect(() =>
      service.verifyUserOwnership(loggedUserId, targetUserId),
    ).not.toThrow();
  });
  it('should thow ForbiddenException if user is not owner', () => {
    loggedUserId = 'id-1';
    targetUserId = 'id-2';

    expect(() =>
      service.verifyUserOwnership(loggedUserId, targetUserId),
    ).toThrow(ForbiddenException);
  });
});
