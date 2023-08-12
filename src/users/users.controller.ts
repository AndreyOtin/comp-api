import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@SerializeResponse(UserDto)
@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  private signJWT(id: number, secret: string, role: 'USER' | 'ADMIN') {
    return new Promise((res, rej) => {
      sign(
        {
          id,
          role,
          issuedAt: new Date()
        },
        secret,
        {
          algorithm: 'HS256',
          expiresIn: '24h'
        },
        (err, token) => {
          if (err) {
            rej(err);
          }

          res(token as string);
        }
      );
    });
  }

  @Post('/signin')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.registerUser(body);
    const token = await this.signJWT(user.id, this.configService.get('COOKIE_KEY'), 'USER');

    return { ...user, token };
  }

  @Post('/signup')
  async authUser(@Body() body: CreateUserDto) {
    const user = await this.authService.authenticateUser(body.email, body.password);
    const token = await this.signJWT(user.id, this.configService.get('COOKIE_KEY'), 'USER');

    return { ...user, token };
  }

  @Post('/signout')
  async signOut() {
    return null;
  }

  @UseGuards(AuthGuard)
  @Post('/cart')
  async addToCart(@Body() body: AddToCartDto, @CurrentUser() user: User) {
    return await this.userService.addToCart(body, user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('/cart')
  async updateCard(@Body() body: UpdateCartDto, @CurrentUser() user: User) {
    return await this.userService.updateCard(body, user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('/cart')
  async deleteFromCard(@Query() body: DeleteFromCartDto, @CurrentUser() user: User) {
    return await this.userService.deleteFromCard(user.id, body);
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
