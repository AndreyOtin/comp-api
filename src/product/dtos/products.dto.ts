import { IsEnum, IsNumber, IsOptional } from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  category: number;
}
