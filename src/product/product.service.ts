import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Between, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Details } from './entities/details.entity';
import { ProductsDto } from './dtos/products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Details) private detailsRepo: Repository<Details>,
  ) {}

  async getPriceRange() {
    const totalMin = await this.productRepo.minimum('price');
    const totalMax = await this.productRepo.maximum('price');
    const rangedProducts = {} as Record<string, Product[]>;

    const rangeCount = Math.round(totalMax / totalMin);

    for (let i = 1; i < rangeCount; i++) {
      const min = totalMin * i;
      const max = min + totalMin;

      const result = await this.productRepo.find({
        where: {
          price: Between(min, max),
        },
        order: {
          price: 'asc',
        },
      });

      if (result.length) {
        rangedProducts[`${result.at(0).price}-${result.at(-1).price}`] = result;
      }
    }

    return {
      totalMin,
      totalMax,
      rangedProducts,
    };
  }

  async getAll({ limit, offset, priceSort }: ProductsDto) {
    const [products, count] = await this.productRepo.findAndCount({
      take: limit,
      skip: offset,
      order: {
        price: priceSort,
      },
    });

    return {
      count,
      limit,
      offset,
      products,
    };
  }

  async getProduct(id: number) {
    return this.productRepo.find({
      where: {
        id,
      },
      relations: {
        details: true,
        spec: true,
      },
    });
  }

  async getProductCategories() {
    return this.categoryRepo.find({
      relations: {
        products: {
          brand: true,
        },
      },
    });
  }
}
