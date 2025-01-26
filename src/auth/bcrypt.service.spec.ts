import * as bcrypt from 'bcryptjs';
import { BcryptService } from './bcrypt.service';

jest.mock('bcryptjs');

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(() => {
    bcryptService = new BcryptService();
  });

  describe('<Hash />', () => {
    it('should generate a hashed password', async () => {
      const password = 'securePassword';
      const hashedPassword = 'hashedSecurePassword';

      // Mocking bcrypt functions
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await bcryptService.hash(password);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'salt');
      expect(result).toBe(hashedPassword);
      expect(result).toMatchSnapshot(password);
    });
  });

  describe('<Compare />', () => {
    it('should return true if passwords match', async () => {
      const password = 'securePassword';
      const hash = 'hashedSecurePassword';

      // Mocking bcrypt compare function
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await bcryptService.compare(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
      expect(result).toMatchSnapshot(password);
    });

    it('should return false if passwords do not match', async () => {
      const password = 'securePassword';
      const hash = 'wrongHashedPassword';

      // Mocking bcrypt compare function
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await bcryptService.compare(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(false);
      expect(result).toMatchSnapshot(password);
    });
  });
});
