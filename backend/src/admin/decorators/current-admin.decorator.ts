import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminRequestUser } from '../models/admin-request-user';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminRequestUser => {
    return ctx.switchToHttp().getRequest().adminUser;
  },
);
