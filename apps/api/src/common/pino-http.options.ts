import { type ConfigService } from '@nestjs/config';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Options } from 'pino-http';

function isHealthCheck(req: IncomingMessage): boolean {
  const path = (req.url ?? '').split('?')[0];
  return path === '/api/health';
}

export function createPinoHttpOptions(
  config: ConfigService,
): Options<IncomingMessage, ServerResponse> {
  const isProd = config.get<string>('NODE_ENV') === 'production';
  const level = config.get<string>('LOG_LEVEL', 'info');

  return {
    level,
    autoLogging: {
      ignore: isHealthCheck,
    },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[Redacted]',
    },
    ...(isProd
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          },
        }),
  };
}
