import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';
import { Details } from './details.entity';
import { Spec } from './spec.entity';
import { Brand } from './brand.entity';
import { Type } from './type.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  newPrice: number;

  @Column()
  image: string;

  @Column()
  imageLarge: string;

  @Column()
  inStock: boolean;

  @Column()
  isNew: boolean;

  @Column()
  isCustom: boolean;

  @ManyToOne(() => Category, (category) => category.products, { cascade: true })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, { cascade: true })
  brand: Brand;

  @ManyToOne(() => Type, (type) => type.products, { cascade: true })
  type: Type;

  @ManyToOne(() => Details, { cascade: true })
  details: Details;

  @ManyToOne(() => Spec, { cascade: true })
  spec: Spec;
}
