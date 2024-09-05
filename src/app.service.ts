import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { responder } from 'src/_common/helpers/responder.helper';
import { EnvironmentVariables } from 'src/_common/validations/env.validation';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  healthCheck() {
    return responder.success('Live and running, God is good!', {
      environment: this.configService.get('NODE_ENV', { infer: true }),
      status: 'UP',
      uptime: `${process.uptime()} seconds`,
    });
  }
}
