import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    const decodedToken = this.jwtService.verify(token);
    
    return decodedToken.role === 'admin'; // cambiar en función del rol
  }
}