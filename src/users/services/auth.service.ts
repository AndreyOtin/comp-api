import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from '../dtos/create-user.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async registerUser(body: CreateUserDto) {
    const user = await this.userService.find(body.email);

    if (user) {
      throw new BadRequestException('Пользователь с таким емайл уже сущуствует');
    }

    const salt = randomBytes(4).toString('hex');
    const hash = (await scrypt(body.password, salt, 8)) as Buffer;

    body.password = salt + '.' + hash.toString('hex');

    return await this.userService.create(body);
  }

  async authenticateUser(email: string, password: string) {
    const user = await this.userService.find(email);

    if (!user) {
      throw new BadRequestException('Нет такого пользователя');
    }

    const [salt, userPassword] = user.password.split('.');
    const result = (await scrypt(password, salt, 8)) as Buffer;

    if (userPassword !== result.toString('hex')) {
      throw new BadRequestException('Неверный пароль');
    }

    return user;
  }
}
