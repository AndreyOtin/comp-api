import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Details {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cpu: string;

  @Column()
  video: string;

  @Column()
  ram: string;

  @Column()
  hdd: string;

  @Column()
  powerUnit: string;

  @OneToMany(() => Product, (product) => product.details)
  products: Product[];
}
