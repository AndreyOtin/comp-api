import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Cart } from '../entities/cart.entity';
import { ProductCart } from '../entities/product-cart.entity';
import { ProductService } from '../../product/product.service';
import { AddToCartDto, DeleteFromCartDto, UpdateCartDto } from '../dtos/cart.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

const stripe = new Stripe(
  'sk_test_51NfTN0GJUcoJ7LcsPBBFT00IX0zTfHSQaV6gtNyWxv0lvU7gUbDh475p9dnWS548WjNWRe0XVTGyMeug8cyq8NRR00WTtagnM8',
  { apiVersion: '2022-11-15' }
);

@Injectable()
export class UsersService {
  secrets: Record<number, string> = {};

  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(ProductCart) private productCartRepo: Repository<ProductCart>,
    private productService: ProductService,
    private config: ConfigService
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
        cart: {
          productCart: { product: { category: true, details: true, type: true, brand: true } }
        }
      },
      where: { id, ...where }
    });

    if (!user && !where) {
      throw new NotFoundException('user not found');
    }

    const userWithoutItems = await this.repo.findOne({
      relations: {
        cart: {
          productCart: true
        }
      },
      where: { id }
    });

    userWithoutItems.cart.productCart = [];

    return user || userWithoutItems;
  }

  async find(email: string) {
    const user = await this.repo.findOne({
      relations: {
        cart: {
          productCart: { product: { category: true, details: true, type: true, brand: true } }
        }
      },
      where: { email, cart: { productCart: { isPaid: false } } }
    });

    const userWithoutCart = await this.repo.findOne({
      relations: {
        cart: {
          productCart: { product: { category: true, details: true, type: true, brand: true } }
        }
      },
      where: { email }
    });

    if (userWithoutCart?.cart) {
      userWithoutCart.cart.productCart = [];
    }

    return user || userWithoutCart;
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

  async getPurchased(user: User) {
    const products = await this.productCartRepo.find({
      relations: {
        product: {
          category: true,
          type: true,
          brand: true,
          details: true
        }
      },
      where: {
        cartId: user.cart.id,
        isPaid: true
      }
    });

    return {
      products
    };
  }

  async addToCart(body: AddToCartDto, userId: number) {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    const product = await this.productService.getProduct(body.productId);

    const cartProduct = this.productCartRepo.create({
      cartId: user.cart.id,
      productId: product.id,
      count: body.count,
      totalSum: body.count * (product.newPrice ? product.newPrice : product.price)
    });

    await this.productCartRepo.save(cartProduct);

    return await this.findOne(userId, { cart: { productCart: { isPaid: false } } });
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

    return await this.findOne(userId, { cart: { productCart: { isPaid: false } } });
  }

  async deleteFromCard(userId: number, body: DeleteFromCartDto) {
    const user = await this.findOne(userId);
    await this.productCartRepo.delete({
      transactionId: body.transactionId,
      cartId: user.cart.id
    });

    return await this.findOne(userId, { cart: { productCart: { isPaid: false } } });
  }

  async finishOrder(user: User, secret: string) {
    if (secret !== this.secrets[user.id]) {
      throw new BadRequestException('не верный ключ оплаты');
    }

    await this.productCartRepo.update({ cartId: user.cart.id }, { isPaid: true });

    const newUser = await this.findOne(user.id, {
      cart: { productCart: { isPaid: false } }
    });

    this.secrets[user.id] = null;

    return newUser;
  }

  async makeOrder(user: User) {
    const secret = randomBytes(10).toString('hex');
    this.secrets[user.id] = secret;

    const products = await this.productCartRepo.find({
      where: {
        cartId: user.cart.id,
        isPaid: false
      }
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      success_url: `${this.config.get('ORIGIN')}/home/cart?status=${secret}&?nav=purchased`,
      cancel_url: `${this.config.get('ORIGIN')}/home/cart?status=cancel`,
      line_items: products.map<Stripe.Checkout.SessionCreateParams.LineItem>((p) => ({
        quantity: p.count,
        price_data: {
          unit_amount: (p.totalSum / p.count) * 100,
          currency: 'usd',
          product_data: { name: p.product.name }
        }
      }))
    });

    return { sessionId: session.id };
  }
}
