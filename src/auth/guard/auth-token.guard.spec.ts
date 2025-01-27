import { AuthTokenGuard } from './auth-token.guard';

describe('AuthTokenGuard', () => {
  it('should be defined', () => {
    expect(new AuthTokenGuard()).toBeDefined();
  });
});
