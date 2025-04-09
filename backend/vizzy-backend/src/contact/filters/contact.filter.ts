import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import {
  ContactNotFoundException,
  InvalidContactDataException,
  ContactValidationException,
  ContactCreationException,
} from '../exceptions/contact.exception';
import { Response } from 'express';

@Catch(
  ContactNotFoundException,
  InvalidContactDataException,
  ContactValidationException,
  ContactCreationException,
)
export class ContactExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ContactNotFoundException
      | InvalidContactDataException
      | ContactValidationException
      | ContactCreationException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.message,
      timestamp: new Date().toISOString(),
      type: exception.constructor.name,
    });
  }
}
