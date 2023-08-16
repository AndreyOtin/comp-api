import { Expose, Transform } from 'class-transformer';
import { Product } from '../../product/entities/product.entity';

export class PurchasedDto {
  @Expose()
  @Transform(({ obj }) => {
    return [...obj.products];
  })
  products: Product[];
}
