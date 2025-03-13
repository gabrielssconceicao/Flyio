<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
=======
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PermissionService } from '../permission/permission.service';
import { TokenPayloadDto } from '../auth/dto';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryParamDto,
  FindAllUsersResponseDto,
} from './dto';

type UserWithCount = {
  name: string;
  username: string;
  bio: string;
  id: string;
  profileImg: string;
  active: boolean;
  _count: {
    following: number;
    followers: number;
  };
};

@Injectable()
export class UserService {
  constructor(
    private readonly hashingService: HashingServiceProtocol,
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,

    private readonly permissionService: PermissionService,
  ) {}

  private selectUserFields = {
    id: true,
    name: true,
    username: true,
    profileImg: true,
    bio: true,
    active: true,
    _count: { select: { followers: true, following: true } },
  };

  async create(
    createUserDto: CreateUserDto,
    profileImg: Express.Multer.File,
  ): Promise<User> {
    const { password, ...rest } = createUserDto;

    const userExists = await this.prismaService.user.findFirst({
      where: { OR: [{ email: rest.email }, { username: rest.username }] },
    });
    if (!!userExists) {
      throw new ConflictException(
        'This email or username is already associated with an existing account',
      );
    }

    let profileImgUrl = null;
    if (!!profileImg) {
      profileImgUrl =
        await this.cloudinaryService.uploadProfilePicture(profileImg);
    }
    const hashedPassword = await this.hashingService.hash(password);
    const createdUser = await this.prismaService.user.create({
      data: { ...rest, password: hashedPassword, profileImg: profileImgUrl },
      select: this.selectUserFields,
    });
    return this.separateUsersAndCount(createdUser);
  }

  async findAll(query: QueryParamDto): Promise<FindAllUsersResponseDto> {
    const { limit = 50, offset = 0, search = '' } = query;
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
    const count = await this.prismaService.user.count({ where });
    return { count, items: users };
  }

  async findOne(username: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
      select: this.selectUserFields,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.separateUsersAndCount(user);
  }

  async update(
    username: string,
    updateUserDto: UpdateUserDto,
    profileImg: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.permissionService.verifyUserOwnership(tokenPayload.sub, user.id);

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
      bio: updateUserDto?.bio,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );
      personDto['password'] = passwordHash;
    }

    if (!!profileImg) {
      if (user.profileImg) {
        personDto['profileImg'] =
          await this.cloudinaryService.updateProfilePicture(
            profileImg,
            user.profileImg,
          );
      } else {
        personDto['profileImg'] =
          await this.cloudinaryService.uploadProfilePicture(profileImg);
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { username },
      data: { ...personDto },
      select: this.selectUserFields,
    });
    return this.separateUsersAndCount(updatedUser);
  }

  async desactivateUser(username: string, tokenPayload: TokenPayloadDto) {
    const user = await this.findOne(username);
    this.permissionService.verifyUserOwnership(tokenPayload.sub, user.id);
    if (!user.active) {
      throw new BadRequestException('User is already deactivated');
    }

    await this.prismaService.user.update({
      where: { username },
      data: { active: false },
    });
    return { message: 'User desactivated successfully' };
  }

  async removeProfilePicture(
    username: string,
    tokenPayload: TokenPayloadDto,
  ): Promise<User> {
    const user = await this.findOne(username);
    this.permissionService.verifyUserOwnership(tokenPayload.sub, user.id);
    if (user.profileImg) {
      try {
        await this.cloudinaryService.deleteProfilePicture(user.profileImg);
        const userWithoutProfile = await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            profileImg: null,
          },
          select: this.selectUserFields,
        });
        return this.separateUsersAndCount(userWithoutProfile);
      } catch (error) {
        throw error;
      }
    }
    return user;
>>>>>>> images
  }

  private separateUsersAndCount(users: UserWithCount): User {
    const { _count, ...rest } = users;
    return {
      ...rest,
      followers: _count.followers,
      following: _count.following,
    };
  }
}
