import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Spec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cpu: string;

  @Column()
  featured: string;

  @Column()
  ioPorts: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
