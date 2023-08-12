import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Cart } from '../entities/cart.entity';
import { ProductCart } from '../entities/product-cart.entity';
import { ProductService } from '../../product/product.service';
import { AddToCartDto, DeleteFromCartDto, UpdateCartDto } from '../dtos/cart.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(ProductCart) private productCartRepo: Repository<ProductCart>,
    private productService: ProductService
  ) {}

  async create(body: CreateUserDto) {
    const user = this.repo.create(body);
    user.cart = this.cartRepo.create();
    await this.repo.save(user);

    return await this.findOne(user.id);
  }

  async findOne(id: number, where?: FindOptionsWhere<User>) {
    if (!id) {
      return null;
    }

    const user = await this.repo.findOne({
      relations: {
        cart: { productCart: { product: { category: true, details: true, type: true } } }
      },
      where: { id, ...where }
    });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async find(email: string) {
    return this.repo.find({
      where: { email },
      relations: {
        cart: { productCart: { product: { category: true, details: true, type: true } } }
      }
    });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);

    Object.assign(user, attrs);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    return this.repo.remove(user);
  }

  async addToCart(body: AddToCartDto, userId: number) {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const product = await this.productService.getProduct(body.productId);

    const cartProduct = this.productCartRepo.create({
      product: product,
      cart: user.cart,
      count: body.count,
      totalSum: body.count * (product.newPrice ? product.newPrice : product.price)
    });

    await this.productCartRepo.save(cartProduct);

    return await this.findOne(userId);
  }

  async updateCard(body: UpdateCartDto, userId: number) {
    const user = await this.findOne(userId);
    const product = await this.productService.getProduct(body.productId);

    if (!user || !product) {
      throw new BadRequestException('product not found or login again');
    }

    await this.productCartRepo.update(
      {
        transactionId: body.transactionId,
        cartId: user.cart.id
      },
      {
        totalSum: body.count * (product?.newPrice ? product.newPrice : product.price),
        count: body.count
      }
    );

    return await this.findOne(userId);
  }

  async deleteFromCard(userId: number, body: DeleteFromCartDto) {
    const user = await this.findOne(userId);
    await this.productCartRepo.delete({
      transactionId: body.transactionId,
      cartId: user.cart.id
    });

    return await this.findOne(userId);
  }
}
