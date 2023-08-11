import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Spec } from './entities/spec.entity';
import { Details } from './entities/details.entity';
import { Type } from './entities/type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Brand, Spec, Details, Type])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
