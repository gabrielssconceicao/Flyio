import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRelationsService } from './user-relations.service';
import { UserController } from './user.controller';
import { UserRelationsController } from './user-relations.controller';

@Module({
  imports: [],
  controllers: [UserController, UserRelationsController],
  providers: [UserService, UserRelationsService],
})
export class UserModule {}
