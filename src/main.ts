import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new ConfigService();

  app.enableCors({
    credentials: true,
    origin: [config.get('ORIGIN'), 'http://91.201.41.167:3050']
  });
  app.use(compression());

  await app.listen(3000);
}

void bootstrap();
