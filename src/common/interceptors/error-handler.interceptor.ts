import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        // Registra el error
        this.logger.error(`Error: ${error.message}`, error.stack);
        
        // Si ya es un HttpException lo pasamos
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        
        // Manejar errores específicos de Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002': // Unique constraint violation
              return throwError(() => new HttpException(
                'Ya existe un registro con estos datos',
                HttpStatus.CONFLICT
              ));
            case 'P2025': // Record not found
              return throwError(() => new HttpException(
                'Registro no encontrado',
                HttpStatus.NOT_FOUND
              ));
            default:
              return throwError(() => new HttpException(
                'Error en la base de datos',
                HttpStatus.INTERNAL_SERVER_ERROR
              ));
          }
        }
        
        // Para otros errores devuelve un error genérico
        return throwError(() => new HttpException(
          'Ha ocurrido un error inesperado',
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
      })
    );
  }
} 