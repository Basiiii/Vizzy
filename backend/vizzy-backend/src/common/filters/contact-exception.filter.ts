import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(Error)
export class ContactExceptionFilter implements ExceptionFilter {
  private errorMap = {
    'required fields': HttpStatus.BAD_REQUEST,
    'Invalid userId': HttpStatus.UNAUTHORIZED,
    'Failed to add contact': HttpStatus.INTERNAL_SERVER_ERROR,
  };

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (error instanceof HttpException) {
      response.status(error.getStatus()).json(error.getResponse());
      return;
    }

    // Check for known error messages
    for (const [message, status] of Object.entries(this.errorMap)) {
      if (error.message.includes(message)) {
        response.status(status).json({
          statusCode: status,
          message: error.message,
        });
        return;
      }
    }

    // Default error response
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unknown error occurred',
    });
  }
}
