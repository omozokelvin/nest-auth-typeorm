import { Controller, Get } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  home() {
    return this.appService.healthCheck();
  }

  @Get('/health')
  healthCheck() {
    return this.appService.healthCheck();
  }
}
