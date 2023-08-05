import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Between, In, IsNull, Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Details } from './entities/details.entity';
import { ProductsDto } from './dtos/products.dto';
import { Type } from './entities/type.entity';
import { Brand } from './entities/brand.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Details) private detailsRepo: Repository<Details>,
    @InjectRepository(Type) private typesRepo: Repository<Type>,
    @InjectRepository(Brand) private brandsRepo: Repository<Brand>
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
          price: Between(min, max)
        },
        order: {
          price: 'asc'
        }
      });

      if (result.length) {
        rangedProducts[`${result.at(0).price}-${result.at(-1).price}`] = result;
      }
    }

    return {
      totalMin,
      totalMax,
      rangedProducts
    };
  }

  async getAll({
    limit,
    offset,
    priceSort,
    category,
    isNew,
    inStock,
    isCustom,
    brand,
    price,
    color,
    type
  }: ProductsDto) {
    const prices = price && price.flatMap((el) => el.split('-').map((el) => Number(el)));

    const [products, count] = await this.productRepo.findAndCount({
      relations: {
        category: true,
        type: true,
        brand: true
      },
      where: {
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
        price: price && Between(Math.min(...prices), Math.max(...prices)),
        color: color && In(color)
      },
      order: {
        price: priceSort,
        inStock: inStock ? -1 : 1
      },
      take: limit,
      skip: offset
    });

    console.log(brand);

    return {
      count,
      limit,
      offset,
      products
    };
  }

  async getProduct(id: number) {
    return this.productRepo.find({
      where: {
        id
      },
      relations: {
        details: true,
        spec: true
      }
    });
  }

  async getProductCategories({ isProducts }) {
    return this.categoryRepo.find({
      relations: {
        types: true,
        products: isProducts
      },
      where: {
        types: {
          id: Not(IsNull())
        }
      }
    });
  }

  async getProductCategory(id: number) {
    return this.categoryRepo.find({
      relations: {
        products: true
      },
      where: {
        id
      }
    });
  }

  async getProductTypes({ isProducts }) {
    return this.typesRepo.find({
      relations: {
        products: isProducts
      }
    });
  }

  async getProductType(id: number, query: ProductsDto) {
    return this.typesRepo.find({
      relations: {
        products: {
          category: true
        }
      },
      where: {
        id,
        products: {
          category: {
            id: query.category && In(query.category)
          }
        }
      }
    });
  }

  async getBrands({ isProducts }) {
    return this.brandsRepo.find({
      relations: {
        products: isProducts
      }
    });
  }
}
