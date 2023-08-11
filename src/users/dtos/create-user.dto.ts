import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail(
    {},
    {
      message: 'Введите корректный емайл'
    }
  )
  email: string;

  @MinLength(3, { message: 'Пароль минимум 3 символа' })
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  admin: boolean;
}
