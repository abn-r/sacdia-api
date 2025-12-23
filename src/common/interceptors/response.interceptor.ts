import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Configuration options for the response interceptor
 */
export interface ResponseInterceptorOptions {
  idField?: string;
  excludeFields?: string[];
  includeTimestamp?: boolean;
}

/**
 * Unified response interceptor that handles response transformation
 * Replaces CatalogResponseInterceptor and ClassesResponseInterceptor
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private options: ResponseInterceptorOptions = {}) {
    this.options = {
      idField: 'id',
      excludeFields: [],
      includeTimestamp: false,
      ...options
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If response already has status field, return as-is (already formatted)
        if (data && typeof data.status === 'boolean') {
          return this.processFormattedResponse(data, context);
        }

        // Handle paginated response (has data and total)
        if (data && data.data && typeof data.total === 'number') {
          return {
            status: true,
            data: this.transformData(data.data),
            meta: {
              total: data.total,
              page: parseInt(context.switchToHttp().getRequest().query.page) || 1,
              limit: parseInt(context.switchToHttp().getRequest().query.take) || 100,
              nextCursor: data.nextCursor
            }
          };
        }

        // Handle array response
        if (Array.isArray(data)) {
          return {
            status: true,
            data: this.transformData(data),
            meta: { total: data.length }
          };
        }

        // Handle single object response
        return {
          status: true,
          data: this.transformItem(data)
        };
      })
    );
  }

  private processFormattedResponse(data: any, context: ExecutionContext): any {
    // If it has data array and total, add meta
    if (data.data && typeof data.total === 'number') {
      return {
        status: data.status,
        data: this.transformData(data.data),
        message: data.message,
        meta: {
          total: data.total,
          page: parseInt(context.switchToHttp().getRequest().query.page) || 1,
          limit: parseInt(context.switchToHttp().getRequest().query.take) || 100,
          nextCursor: data.nextCursor
        }
      };
    }

    // If it has data, transform it
    if (data.data) {
      return {
        ...data,
        data: Array.isArray(data.data) ? this.transformData(data.data) : this.transformItem(data.data)
      };
    }

    return data;
  }

  private transformData(data: any[]): any[] {
    return data.map(item => this.transformItem(item));
  }

  private transformItem(item: any): any {
    if (!item) return item;

    const result = { ...item };

    // Exclude specified fields
    if (this.options.excludeFields) {
      this.options.excludeFields.forEach(field => {
        delete result[field];
      });
    }

    return result;
  }
}
