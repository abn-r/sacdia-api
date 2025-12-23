import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CatalogResponseOptions {
  idField?: string;
  excludeFields?: string[];
  includeCount?: boolean;
}

@Injectable()
export class CatalogResponseInterceptor implements NestInterceptor {
  constructor(private options: CatalogResponseOptions = {}) {
    this.options = {
      idField: 'id',
      excludeFields: [],
      includeCount: false,
      ...options
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Si es una respuesta paginada (tiene data y total)
        if (data && data.data && typeof data.total === 'number') {
          return {
            data: this.transformData(data.data),
            total: data.total,
            page: context.switchToHttp().getRequest().query.page || 1,
            limit: context.switchToHttp().getRequest().query.take || 100
          };
        }
        
        // Si es un array simple
        if (Array.isArray(data)) {
          return this.transformData(data);
        }
        
        // Si es un objeto simple
        return this.transformItem(data);
      })
    );
  }

  private transformData(data: any[]): any[] {
    return data.map(item => this.transformItem(item));
  }

  private transformItem(item: any): any {
    if (!item) return item;
    
    const result = { ...item };
    
    // Excluir campos específicos
    if (this.options.excludeFields) {
      this.options.excludeFields.forEach(field => {
        delete result[field];
      });
    }
    
    return result;
  }
} 