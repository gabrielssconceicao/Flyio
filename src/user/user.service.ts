import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { QueryParamDto } from './dto/query-param.dto';
import { FindAllUsersResponseDto } from './dto/find-all-users.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly hashingService: HashingServiceProtocol,
    private readonly prismaService: PrismaService,
  ) {}

  private selectUserFields = {
    id: true,
    name: true,
    username: true,
    email: true,
    profileImg: true,
    bio: true,
    active: true,
  };

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;

    const userExists = await this.userExists(
      createUserDto.email,
      createUserDto.username,
    );
    if (userExists) {
      throw new ConflictException(
        'This email or username is already associated with an existing account',
      );
    }

    const hashedPassword = await this.hashingService.hash(password);
    const createdUser = await this.prismaService.user.create({
      data: { ...rest, password: hashedPassword },
      select: this.selectUserFields,
    });
    return createdUser;
  }

  async findAll(query: QueryParamDto): Promise<FindAllUsersResponseDto> {
    const { limit = 1, offset = 0, search = '' } = query;
    const where = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};
    const users = await this.prismaService.user.findMany({
      where: where,
      select: {
        id: true,
        name: true,
        username: true,
        profileImg: true,
      },
      take: limit,
      skip: offset,
    });
    const count = await this.prismaService.user.count();
    return { count, users };
  }

  private async userExists(email: string, username: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    return !!user;
  }

  async findOne(username: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      select: this.selectUserFields,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(username);

    if (updateUserDto?.email && updateUserDto.email !== user.email) {
      const emailIsTaken = await this.prismaService.user.findFirst({
        where: { email: updateUserDto?.email, NOT: { id: user.id } },
      });

      if (emailIsTaken) {
        throw new ConflictException(
          'Email is already associated with an existing account',
        );
      }
    }

    const personDto = {
      name: updateUserDto?.name,
      email: updateUserDto?.email,
      profileImg: updateUserDto?.profileImg,
      bio: updateUserDto?.bio,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );
      personDto['password'] = passwordHash;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { username },
      data: { ...personDto },
      select: this.selectUserFields,
    });

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user || !user.active) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: { id },
      data: { active: false },
    });
    return { message: 'User deleted successfully' };
  }
}
