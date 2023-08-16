import { IntersectionType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  count: number;

  @IsNumber()
  productId: number;
}

export class UpdateCartDto extends IntersectionType(AddToCartDto) {
  @IsNumber()
  transactionId: number;
}

export class DeleteFromCartDto {
  @IsNumber()
  transactionId: number;

  @IsOptional()
  @IsString()
  secret: string;
}

export class OrderDto {
  @IsString()
  secret: string;
}
