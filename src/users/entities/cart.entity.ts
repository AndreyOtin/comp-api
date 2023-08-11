import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ProductCart } from './product-cart.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.cart)
  user: User;

  @OneToMany(() => ProductCart, (productCart) => productCart.cart, { eager: true })
  public productCart: ProductCart[];
}
