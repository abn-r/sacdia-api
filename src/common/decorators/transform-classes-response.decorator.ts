import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ClassesResponseInterceptor, ClassesResponseOptions } from '../interceptors/classes-response.interceptor';

export function TransformClassesResponse(options?: ClassesResponseOptions) {
  return applyDecorators(
    UseInterceptors(new ClassesResponseInterceptor(options))
  );
} 