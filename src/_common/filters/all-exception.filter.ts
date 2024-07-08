import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const status = exception?.response?.error || 'Internal server error';

    const message = exception?.message || 'Internal server error';

    if (statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
      const message = exception.response?.message || [];

      response.status(statusCode).json({
        errors: exception.response?.message || message || null,
      });

      return;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      status,
    });
  }
}
