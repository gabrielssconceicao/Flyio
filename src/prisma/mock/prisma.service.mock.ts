export const userPrismaService = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

export const postPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  postLikes: {
    create: jest.fn(),
    delete: jest.fn(),
  },
};

export const selectUserFieldsMock = {
  id: true,
  name: true,
  username: true,
  profileImg: true,
  bio: true,
  active: true,
  _count: { select: { following: true, followers: true } },
};
