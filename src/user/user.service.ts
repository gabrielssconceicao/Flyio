import { Injectable } from '@nestjs/common';
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
    const hashedPassword = await this.hashingService.hash(password);
    const createdUser = await this.prismaService.user.create({
      data: { ...rest, password: hashedPassword },
      select: this.selectUserFields,
    });
    return createdUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
