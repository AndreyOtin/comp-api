import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Cart } from './cart.entity';

@Entity()
export class ProductCart {
  @PrimaryGeneratedColumn()
  public transactionId: number;

  @Column()
  public cartId: number;

  @Column()
  public productId: number;

  @Column()
  public count: number;

  @Column()
  public totalSum: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cart, (cart) => cart.productCart, { cascade: true })
  public cart: Cart;

  @ManyToOne(() => Product, (product) => product.productCart, { cascade: true, eager: true })
  public product: Product;
}
