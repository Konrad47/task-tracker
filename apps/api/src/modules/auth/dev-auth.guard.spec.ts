import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { DevAuthGuard } from './dev-auth.guard';

function createContext(headers: Record<string, string | string[] | undefined>) {
  const request: {
    headers: Record<string, string | string[] | undefined>;
    user?: { id: string };
  } = { headers };
  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
  return { context, request };
}

function createGuard(devUserId?: string) {
  const config = {
    get: (key: string) => (key === 'DEV_USER_ID' ? devUserId : undefined),
  };
  return new DevAuthGuard(config as ConfigService);
}

describe('DevAuthGuard', () => {
  it('uses x-user-id when present', () => {
    const guard = createGuard('fallback');
    const { context, request } = createContext({ 'x-user-id': 'header-user' });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'header-user' });
  });

  it('uses the first value when x-user-id is an array', () => {
    const guard = createGuard('fallback');
    const { context, request } = createContext({
      'x-user-id': ['first', 'second'],
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'first' });
  });

  it('falls back to DEV_USER_ID when the header is blank', () => {
    const guard = createGuard('dev-user');
    const { context, request } = createContext({ 'x-user-id': '   ' });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'dev-user' });
  });

  it('throws when neither header nor DEV_USER_ID is set', () => {
    const guard = createGuard(undefined);
    const { context } = createContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('DEV_USER_ID is not configured');
  });
});
