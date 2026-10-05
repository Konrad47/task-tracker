import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CurrentUser } from './current-user';

@Injectable()
export class DevAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: CurrentUser;
    }>();

    const header = request.headers['x-user-id'];
    const headerValue = Array.isArray(header) ? header[0] : header;
    const userId =
      (typeof headerValue === 'string' && headerValue.trim()) ||
      this.config.get<string>('DEV_USER_ID');

    if (!userId) {
      throw new UnauthorizedException('DEV_USER_ID is not configured');
    }

    request.user = { id: userId };
    return true;
  }
}
