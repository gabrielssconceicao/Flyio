import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /*
  @ApiOperation({ summary: 'Criar um novo recado' }) // Descrição da operação
  @ApiResponse({
    status: 201,
    description: 'Recado criado com sucesso.',
    type: ResponseRecadoDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.',
    type: BadRequestException,
    example: new BadRequestException('Error Message').getResponse(),
  })
  */
  @ApiOperation({ summary: 'Create a new user' })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
