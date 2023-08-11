import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Between, In, IsNull, Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Details } from './entities/details.entity';
import { ProductsDto } from './dtos/products.dto';
import { Type } from './entities/type.entity';
import { Brand } from './entities/brand.entity';
import { getFindOptions } from './utils/utils';

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

    return {
      count,
      limit,
      offset,
      products
    };
  }

  async getProduct(id: number) {
    if (Number.isNaN(id)) {
      throw new BadRequestException();
    }
    console.log(id);
    return this.productRepo.findOne({
      where: {
        id
      },
      relations: {
        details: true,
        spec: true
      },
      select: {
        details: {
          products: true,
          cpu: true,
          hdd: true,
          ram: true,
          video: true,
          powerUnit: true
        },
        spec: {
          cpu: true,
          ioPorts: true,
          featured: true
        }
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
    if (Number.isNaN(id)) {
      throw new BadRequestException();
    }

    return this.categoryRepo.find({
      relations: {
        products: true
      },
      where: {
        id
      }
    });
  }

  async getProductTypes(query: ProductsDto) {
    const options = getFindOptions(query);
    delete options['type'];

    return this.typesRepo.find({
      relations: {
        products: query.isProducts
      },
      where: {
        products: {
          ...options
        }
      }
    });
  }

  async getProductType(id: number, query: ProductsDto) {
    if (Number.isNaN(id)) {
      throw new BadRequestException();
    }

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
