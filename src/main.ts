import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new ConfigService();

  app.enableCors({
    credentials: true,
    origin: [config.get('ORIGIN')]
  });
  app.use(compression());

  await app.listen(3000);
}

void bootstrap();
