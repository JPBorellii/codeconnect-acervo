import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

function validationMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...validationMessages(error.children ?? []),
  ]);
}

export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => ({
        statusCode: 400,
        message: 'Dados de entrada inválidos',
        errors: validationMessages(errors),
      }),
    }),
  );
}
