import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private userService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const id = req.session.userId;

    if (id) {
      req.user = await this.userService.findOne(id);
    }

    return next();
  }
}
