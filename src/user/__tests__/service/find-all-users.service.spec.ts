import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { generateFindAllUsersResponseDtoMock } from '../../mocks';
import { UserService } from '../../user.service';
import { FindAllUsersResponseDto } from '../../dto';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { hashingServiceMock, jwtServiceMock } from 'src/auth/mocks';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryServiceMock } from 'src/cloudinary/mocks';
import { PermissionService } from 'src/permission/permission.service';

describe('<UserService - (findAll) />', () => {
  let service: UserService;
  let hashingService: HashingServiceProtocol;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  let findAllUsersResponse: FindAllUsersResponseDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashingServiceProtocol,
          useValue: hashingServiceMock,
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            findAll: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PermissionService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);

    findAllUsersResponse = generateFindAllUsersResponseDtoMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cloudinaryService).toBeDefined();
  });

  it('should search for a list of users ', async () => {
    const query = {
      search: 'jD',
      limit: 1,
      offset: 0,
    };

    jest.spyOn(prismaService, 'findAll').mockResolvedValue({
      count: findAllUsersResponse.count,
      items: findAllUsersResponse.items,
    } as any);

    const result = await service.findAll(query);

    expect(prismaService.findAll).toHaveBeenCalled();
    expect(result.count).toBe(1);
    expect(result.items.length).toBe(1);
    expect(result).toEqual(findAllUsersResponse);
    expect(result).toMatchSnapshot();
  });
});
