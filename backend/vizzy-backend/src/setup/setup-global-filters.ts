import { GlobalHttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ValidationExceptionFilter } from '@/common/filters/validation-exception.filter';

export function setupGlobalFilters(app) {
  app.useGlobalFilters(
    new GlobalHttpExceptionFilter(),
    new ValidationExceptionFilter(),
  );
}
