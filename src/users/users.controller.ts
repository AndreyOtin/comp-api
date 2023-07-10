import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session, UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser, SerializeResponse } from '../decorators/app';
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('users')
@SerializeResponse(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signin')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.registerUser(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signup')
  async authUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.authenticateUser(
      body.email,
      body.password,
    );
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  async signOut(@Session() session: any) {
    session.userId = null;
  }

  @Post('/info')
  @UseGuards(AuthGuard)
  async getInfo(@CurrentUser() user: User) {
    return user;
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    return await this.userService.findOne(parseInt(id));
  }

  @Get()
  async findUsers(@Query('email') email: string) {
    return await this.userService.find(email);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.remove(parseInt(id));
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.update(parseInt(id), body);
  }
}
