import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionService {
  constructor(private jwtService: JwtService) {}

  async refreshSession(token: string) {
    const decodedToken = this.jwtService.verify(token);
    
    // Verificar si el token está cerca de expirar
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp - currentTime < 300) { // menos de 5 minutos para expirar
      // Generar un nuevo token
      return this.jwtService.sign({
        sub: decodedToken.sub,
        email: decodedToken.email,
        // ... otros campos necesarios
      });
    }
    
    return token; // Devolver el mismo token si no está cerca de expirar
  }
}