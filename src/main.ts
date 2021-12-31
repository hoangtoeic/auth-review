import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { User } from './db/entities/user.entity';
import {ConnectionManager} from 'typeorm'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const connectionManager = new ConnectionManager();

  await app.listen(3000);
}
bootstrap();
