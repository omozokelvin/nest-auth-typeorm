import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isNotEmptyObject } from 'class-validator';

export const GetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return isNotEmptyObject(request?.user) ? request.user : null;
  },
);
