export const userPrismaService = {
  user: {
    create: jest.fn(),
  },
};

export const selectUserFieldsMock = {
  name: true,
  username: true,
  email: true,
  profileImg: true,
  bio: true,
};
