import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private userService: UsersService, private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const secret = this.configService.get('COOKIE_KEY');

      verify(token, secret, async (err, payload) => {
        if (err) {
          next();
        } else if (payload) {
          const user =
            payload.id &&
            (await this.userService.findOne(payload.id, {
              cart: { productCart: { isPaid: false } }
            }));

          req.user = { ...user, token };
          next();
        }
      });
    } else {
      next();
    }
  }
}
