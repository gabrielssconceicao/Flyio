import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PermissionService } from '../permission/permission.service';
import { TokenPayloadDto } from '../auth/dto';
import { User } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ReactivateUserDto,
  QueryParamDto,
  FindAllUsersResponseDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly hashingService: HashingServiceProtocol,
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly jwtService: JwtService,
    private readonly permissionService: PermissionService,
  ) {}

  private selectUserFields = {
    id: true,
    name: true,
    username: true,
    profileImg: true,
    bio: true,
    active: true,
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
    return createdUser;
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
    return { count, users };
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

    return updatedUser;
  }

  async desactivateUser(username: string, tokenPayload: TokenPayloadDto) {
    const user = await this.findOne(username);
    if (!user.active) {
      throw new BadRequestException('User is already deactivated');
    }
    this.permissionService.verifyUserOwnership(tokenPayload.sub, user.id);

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
        return userWithoutProfile;
      } catch (error) {
        throw error;
      }
    }
    return user;
  }

  async reactivate(reactivateUserDto: ReactivateUserDto) {
    try {
      const { sub } = this.jwtService.verify(reactivateUserDto.token);
      await this.prismaService.user.update({
        where: { id: sub },
        data: { active: true },
      });
      return { message: 'Account reactivated successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
