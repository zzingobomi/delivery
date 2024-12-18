import { Controller, Get } from '@nestjs/common';

@Controller('version')
export class VersionController {
  @Get()
  checkVersion() {
    return '0.1.1';
  }
}
