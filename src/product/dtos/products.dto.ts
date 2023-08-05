import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

enum Sort {
  Asc = 'asc',
  Desc = 'desc'
}

export class ProductsDto {
  @IsNumber()
  @IsOptional()
  limit: number;

  @IsNumber()
  @IsOptional()
  offset: number;

  @IsEnum(Sort)
  @IsOptional()
  priceSort: FindOptionsOrderValue;

  @IsArray()
  @IsOptional()
  category: number[];

  @IsArray()
  @IsOptional()
  brand: number[];

  @IsArray()
  @IsOptional()
  price: string[];

  @IsBoolean()
  @IsOptional()
  isNew: boolean;

  @IsBoolean()
  @IsOptional()
  inStock: boolean;

  @IsBoolean()
  @IsOptional()
  isCustom: boolean;

  @IsBoolean()
  @IsOptional()
  isProducts: boolean;

  @IsArray()
  @IsOptional()
  color: string[];

  @IsArray()
  @IsOptional()
  type: string[];
}
