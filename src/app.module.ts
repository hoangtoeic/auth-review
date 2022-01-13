import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './main/auth/auth.module';
import {TypeOrmModule} from '@nestjs/typeorm'
import { User } from './db/entities/user.entity';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
