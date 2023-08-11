import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';

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

export class DeleteFromCartDto extends PartialType(UpdateCartDto) {}
