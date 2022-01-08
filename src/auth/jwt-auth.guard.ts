import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  roles: string[]
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    this.roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('JwtAuthGuard=roles', this.roles)
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JwtAuthGuard-user',user)
    
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (!this.roles) {
      return true;
    }
    if (this.roles.includes(user.scope)) {
      return user
    }
    throw new ForbiddenException();
  }
}
