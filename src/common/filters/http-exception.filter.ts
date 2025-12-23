import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const error = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: error,
      path: request.url,
    };

    // Log error details
    this.logger.error(
      `HTTP Exception: ${status} - ${request.method} ${request.url}`,
      error instanceof Object && 'message' in error
        ? (error as any).message
        : error,
    );

    response.status(status).json(errorResponse);
  }
}