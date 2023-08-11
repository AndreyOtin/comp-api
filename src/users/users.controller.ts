import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './services/users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './services/auth.service';
import { CurrentUser, SerializeResponse } from '../decorators/app';
import { User } from './entities/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AddToCartDto, DeleteFromCartDto, UpdateCartDto } from './dtos/cart.dto';

@SerializeResponse(UserDto)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService, private authService: AuthService) {}

  @Post('/signin')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.registerUser(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signup')
  async authUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.authenticateUser(body.email, body.password);
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  async signOut(@Session() session: any) {
    session.userId = null;
  }

  @Post('/cart')
  async addToCart(@Body() body: AddToCartDto, @Session() { userId }: { userId: number }) {
    return await this.userService.addToCart(body, userId);
  }

  @Patch('/cart')
  async updateCard(@Body() body: UpdateCartDto, @Session() { userId }: { userId: number }) {
    return await this.userService.updateCard(body, userId);
  }

  @Delete('/cart')
  async deleteFromCard(
    @Query() body: DeleteFromCartDto,
    @Session() { userId }: { userId: number }
  ) {
    return await this.userService.deleteFromCard(userId, body);
  }

  @Post('/info')
  @UseGuards(AuthGuard)
  async getInfo(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(AdminGuard)
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    return await this.userService.findOne(parseInt(id));
  }

  @UseGuards(AdminGuard)
  @Get()
  async findUsers(@Query('email') email: string) {
    return await this.userService.find(email);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.remove(parseInt(id));
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return await this.userService.update(parseInt(id), body);
  }
}
