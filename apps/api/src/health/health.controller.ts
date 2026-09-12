import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    if (
      this.connection.readyState !== ConnectionStates.connected ||
      !this.connection.db
    ) {
      throw new ServiceUnavailableException({
        status: 'error',
        mongo: 'disconnected',
      });
    }

    await this.connection.db.admin().command({ ping: 1 });
    return { status: 'ok', mongo: 'ok' };
  }
}
