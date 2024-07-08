import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Test = 'test',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
