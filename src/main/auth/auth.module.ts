import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import {jwtConstants} from '../../utils/constant/jwtConstants'

@Module({
  imports: [PassportModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,]
})
export class AuthModule {}
