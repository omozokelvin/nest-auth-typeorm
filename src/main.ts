import {
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  Environment,
  EnvironmentVariables,
} from 'src/_common/validations/env.validation';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const isProduction = configService.get('NODE_ENV') === Environment.Production;

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

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
