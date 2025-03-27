import { HttpException, HttpStatus } from '@nestjs/common';

export class ContactNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Contact with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidContactDataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ContactValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ContactCreationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
