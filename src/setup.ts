import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  EnvironmentEnum,
  EnvironmentVariables,
} from 'src/_common/validations/env.validation';

export async function setupApp(app) {
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const transformed = validationErrors.map((error) => {
          const message = Object.values(error.constraints)[0];

          return {
            field: error.property,
            message,
          };
        });

        return new UnprocessableEntityException(transformed);
      },
    }),
  );

  const configService = app.get(ConfigService<EnvironmentVariables>);

  const isProduction = configService.get('NODE_ENV') === EnvironmentEnum.prod;

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('HNG AUTH SERVER')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
  }
}
