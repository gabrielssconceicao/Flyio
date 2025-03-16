import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('<PrismaService />', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    jest.spyOn(service, '$disconnect').mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should call $connect on module init', async () => {
    const connectSpy = jest.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it('should call $disconnect on module destroy', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect');
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  describe('findAll', () => {
    it('should return count and items', async () => {
      const items = [];
      const count = 0;
      const mockModel = {
        count: jest.fn().mockResolvedValue(count),
        findMany: jest.fn().mockResolvedValue(items),
      };

      const options = {
        where: {},
        select: {},
        orderBy: {},
        skip: 0,
        take: 10,
      };

      const result = await service.findAll(mockModel, options);

      expect(mockModel.count).toHaveBeenCalledWith({ where: options.where });
      expect(mockModel.findMany).toHaveBeenCalledWith(options);
      expect(result).toEqual({
        count,
        items,
      });
      expect(result).toMatchSnapshot();
    });
  });
});
