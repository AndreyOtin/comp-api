import { Expose, Transform } from 'class-transformer';
import { ProductCart } from '../entities/product-cart.entity';

export class UserDto {
  @Expose()
  email: string;

  @Expose()
  token: string;

  @Expose()
  secret: string;

  @Expose()
  sessionId: string;

  @Expose()
  @Transform(({ obj }: { obj: { cart: { productCart: ProductCart[] } } }) => {
    return {
      items: obj.cart?.productCart?.map((el) => ({
        transactionId: el.transactionId,
        count: el.count,
        totalSum: el.totalSum,
        product: el.product
      }))
    };
  })
  cart: object;
}
