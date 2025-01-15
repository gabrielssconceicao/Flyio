export const userPrismaService = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

export const selectUserFieldsMock = {
  id: true,
  name: true,
  username: true,
  email: true,
  profileImg: true,
  bio: true,
  active: true,
};
