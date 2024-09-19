import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: any, res: any, next: () => void) {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = this.jwtService.verify(token);
    
    console.log(`Usuario ${decodedToken.sub} accedió a ${req.path} en ${new Date()}`);
    next();
  }
}