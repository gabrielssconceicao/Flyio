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

@Injectable()
export class UserService {
  constructor(
    private readonly hashingService: HashingServiceProtocol,
    private readonly prismaService: PrismaService,
  ) {}

  private selectUserFields = {
    name: true,
    username: true,
    email: true,
    profileImg: true,
    bio: true,
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

  // For testing
  findAll(): Promise<User[]> {
    return this.prismaService.user.findMany({
      select: this.selectUserFields,
    });
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

  async update(username: string, updateUserDto: UpdateUserDto) {
    const personDto = {
      name: updateUserDto?.name,
      email: updateUserDto?.email,
      profileImg: updateUserDto?.profileImg,
      bio: updateUserDto?.bio,
    };

    const userExists = await this.userExists(personDto.email, username);

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
