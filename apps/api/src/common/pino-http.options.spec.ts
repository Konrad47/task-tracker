import { ConfigService } from '@nestjs/config';
import type { IncomingMessage } from 'node:http';
import { createPinoHttpOptions } from './pino-http.options';

function createConfig(values: Record<string, string | undefined>) {
  return {
    get: (key: string, defaultValue?: string) => values[key] ?? defaultValue,
  } as ConfigService;
}

function requestWithUrl(url: string): IncomingMessage {
  return { url } as IncomingMessage;
}

describe('createPinoHttpOptions', () => {
  it('defaults log level to info', () => {
    const options = createPinoHttpOptions(createConfig({}));
    expect(options.level).toBe('info');
  });

  it('uses LOG_LEVEL from config', () => {
    const options = createPinoHttpOptions(createConfig({ LOG_LEVEL: 'debug' }));
    expect(options.level).toBe('debug');
  });

  it('enables pino-pretty outside production', () => {
    const options = createPinoHttpOptions(
      createConfig({ NODE_ENV: 'development' }),
    );
    expect(options.transport).toEqual(
      expect.objectContaining({ target: 'pino-pretty' }),
    );
  });

  it('omits pretty transport in production', () => {
    const options = createPinoHttpOptions(
      createConfig({ NODE_ENV: 'production' }),
    );
    expect(options.transport).toBeUndefined();
  });

  it('skips HTTP auto-logging for /api/health including query strings', () => {
    const options = createPinoHttpOptions(createConfig({}));
    const ignore =
      options.autoLogging &&
      typeof options.autoLogging === 'object' &&
      options.autoLogging.ignore;

    expect(typeof ignore).toBe('function');
    if (typeof ignore !== 'function') {
      return;
    }
    expect(ignore(requestWithUrl('/api/health'))).toBe(true);
    expect(ignore(requestWithUrl('/api/health?ts=1'))).toBe(true);
    expect(ignore(requestWithUrl('/api/tasks'))).toBe(false);
  });

  it('redacts authorization and cookie request headers', () => {
    const options = createPinoHttpOptions(createConfig({}));
    expect(options.redact).toEqual(
      expect.objectContaining({
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[Redacted]',
      }),
    );
  });
});
