import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new ConfigService();

  app.enableCors({
    credentials: true,
    origin: config.get('ORIGIN')
  });

  await app.listen(3000);
}

void bootstrap();
