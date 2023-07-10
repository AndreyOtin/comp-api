import { ClassConstructor } from 'class-transformer';
import {
  createParamDecorator,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { Request } from 'express';

export function SerializeResponse(dto: ClassConstructor<object>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export const CurrentUser = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
