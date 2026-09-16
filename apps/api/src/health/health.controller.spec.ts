import { ServiceUnavailableException } from '@nestjs/common';
import { type Connection, ConnectionStates } from 'mongoose';
import { HealthController } from './health.controller';

function createConnection(options: {
  readyState: number;
  db?: { admin: () => { command: (cmd: unknown) => Promise<unknown> } };
}) {
  return options as unknown as Connection;
}

describe('HealthController', () => {
  it('returns ok when Mongo is connected and ping succeeds', async () => {
    const command = jest.fn().mockResolvedValue({ ok: 1 });
    const controller = new HealthController(
      createConnection({
        readyState: ConnectionStates.connected,
        db: { admin: () => ({ command }) },
      }),
    );

    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      mongo: 'ok',
    });
    expect(command).toHaveBeenCalledWith({ ping: 1 });
  });

  it('throws 503 when Mongo is not connected', async () => {
    const controller = new HealthController(
      createConnection({ readyState: ConnectionStates.disconnected }),
    );

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);

    try {
      await controller.check();
    } catch (error) {
      expect((error as ServiceUnavailableException).getResponse()).toEqual({
        status: 'error',
        mongo: 'disconnected',
      });
    }
  });

  it('throws 503 when the connection has no db handle', async () => {
    const controller = new HealthController(
      createConnection({
        readyState: ConnectionStates.connected,
      }),
    );

    await expect(controller.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
