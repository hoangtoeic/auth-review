import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {  jwtConstants } from '../constant/jwtConstants'
import { jwtPayload } from '../interface/jwt-payload.interface';
import { User } from 'src/db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { ConnectionDB } from 'src/connectionDB/connectionDB';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback:true   
    });
  }

  async validate(payload: any): Promise<User> {
    console.log('JwtStrategy-payload',payload)
    const email= payload.user.email
    console.log('JwtStrategy-email',email)
    
    const user = await getManager()
    .createQueryBuilder(User, 'User')
    .where('email = :email', { email: email })
    .getOne();
    
    if(!user)
    {
      throw new UnauthorizedException();
    }
    console.log(user)
    return user;
  }
}