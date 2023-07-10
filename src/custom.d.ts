import { User } from './users/user.entity';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
