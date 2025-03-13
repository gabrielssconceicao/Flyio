import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export function ApiAuthResponses() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized - Token invalid or missing or Login Required',
      schema: {
        example: {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid token/login required',
          error: 'Unauthorized',
        },
      },
    }),

    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden - Token expired',
      schema: {
        example: {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Token expired',
          error: 'Forbidden',
        },
      },
    }),
  );
}
