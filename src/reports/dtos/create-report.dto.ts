import { IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  price: number;

  @IsString()
  model: string;

  @IsString()
  make: string;
}
