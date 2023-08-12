import { ProductsDto } from '../dtos/products.dto';
import { Between, In } from 'typeorm';

export const getFindOptions = ({
  type,
  category,
  brand,
  isNew,
  isCustom,
  color,
  inStock,
  price
}: ProductsDto) => {
  const prices = price && price.flatMap((el) => el.split('-').map((el) => Number(el)));
  return {
    type: {
      id: type && In(type)
    },
    category: {
      id: category && In(category)
    },
    brand: {
      id: brand && In(brand)
    },
    isNew,
    isCustom,
    inStock,
    price: price && Between(Math.min(...prices), Math.max(...prices)),
    color: color && In(color)
  };
};
