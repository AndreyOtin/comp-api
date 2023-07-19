import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductsDto } from './dtos/products.dto';

@Controller('products')
export class ProductController {
  constructor(private productsService: ProductService) {}

  @Get()
  getProducts(@Query() query: ProductsDto) {
    return this.productsService.getAll(query);
  }

  @Get('product/:id')
  getProduct(@Param('id') id: number) {
    return this.productsService.getProduct(id);
  }

  @Get('/range')
  getProductRange(@Param('id') id: number) {
    return this.productsService.getPriceRange();
  }

  @Get('/categories')
  getProductCategories() {
    return this.productsService.getProductCategories();
  }

  @Get('/categories/:id')
  getProductCategory(@Param('id') id: number) {
    return this.productsService.getProductCategory(id);
  }

  @Get('/types')
  getProductTypes() {
    return this.productsService.getProductTypes();
  }

  @Get('/types/:id')
  getProductType(@Param('id') id: number, @Query() query: ProductsDto) {
    return this.productsService.getProductType(id, query.category);
  }
}
