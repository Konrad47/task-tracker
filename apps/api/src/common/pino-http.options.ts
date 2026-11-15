import { type ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
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
    genReqId: (req, res) => {
      const header = req.headers['x-request-id'];
      const incoming = Array.isArray(header) ? header[0] : header;
      const requestId = (typeof incoming === 'string' && incoming.trim()) || randomUUID();
      res.setHeader('x-request-id', requestId);
      return requestId;
    },
    customProps: (req) => ({
      requestId: req.id,
    }),
  };
}
