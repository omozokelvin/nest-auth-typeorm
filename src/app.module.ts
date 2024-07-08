import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllExceptionFilter } from 'src/_common/filters/all-exception.filter';
import { ResponseInterceptor } from 'src/_common/interceptors/response.interceptor';
import { AppController } from 'src/app.controller';
import { UserModule } from 'src/user/user.module';
import {
  Environment,
  EnvironmentVariables,
  validate,
} from './_common/validations/env.validation';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrganisationModule } from './organisation/organisation.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    UserModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        const url = configService.get('DATABASE_URL', { infer: true });
        const isProduction =
          configService.get('NODE_ENV') === Environment.Production;
        const isStaging = configService.get('NODE_ENV') === Environment.Staging;

        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          synchronize: !isProduction,
          // logging: !isProduction,
          ...(isStaging && {
            ssl: {
              rejectUnauthorized: !isProduction,
            },
          }),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    OrganisationModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
