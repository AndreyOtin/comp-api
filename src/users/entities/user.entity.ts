import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  admin: boolean;

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  cart: Cart;
}
