import { Exclude, Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  price: number;

  @Expose()
  model: string;

  @Expose()
  @Transform(({ obj }) => obj.user.id)
  userId: number;
}
