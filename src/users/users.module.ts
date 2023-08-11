import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './services/auth.service';
import { CurrentUserMiddleware } from '../middlewares/current-user.middleware';
import { Cart } from './entities/cart.entity';
import { ProductCart } from './entities/product-cart.entity';
import { Product } from '../product/entities/product.entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Cart, ProductCart, Product]), ProductModule],
  providers: [UsersService, AuthService],
  controllers: [UsersController]
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
