import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PermissionService {
  verifyUserOwnership(loggedUserId: string, targetUserId: string) {
    if (loggedUserId !== targetUserId) {
      throw new ForbiddenException('You do not have permission');
    }
  }
}
