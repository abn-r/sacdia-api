import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { CatalogResponseInterceptor, CatalogResponseOptions } from '../interceptors/catalog-response.interceptor';

export function TransformResponse(options?: CatalogResponseOptions) {
  return applyDecorators(
    UseInterceptors(new CatalogResponseInterceptor(options))
  );
} 