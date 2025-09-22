import { HttpException, HttpStatus } from '@nestjs/common';

interface BusinessErrorOptions {
  message: string | string[]; // user-facing message
  code?: string; // optional custom error code
  statusCode?: HttpStatus; // default = 400
  details?: unknown; // optional extra info for developer
}

export class BusinessException extends HttpException {
  constructor(options: BusinessErrorOptions) {
    const {
      message,
      code,
      statusCode = HttpStatus.BAD_REQUEST,
      details,
    } = options;

    super(
      {
        success: false,
        statusCode,
        message,
        error: code ?? 'BUSINESS_ERROR',
        details, // will only show if NODE_ENV=development in filter
      },
      statusCode,
    );
  }
}
