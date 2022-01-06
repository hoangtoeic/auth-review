import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import {TypeOrmModule} from '@nestjs/typeorm'
import { User } from './db/entities/user.entity';

@Module({
   imports: [AuthModule,
  // TypeOrmModule.forRoot(
  //   {
  //   name: 'test4-connection',
  //   type: 'postgres',
  //   host:'localhost',
  //   port:5432,
  //   username: 'postgres',
  //   password: '14121999aA',
  //   database: 'test2',
  //   entities: [User],
  //   synchronize: false,
  //   }
  //   ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
