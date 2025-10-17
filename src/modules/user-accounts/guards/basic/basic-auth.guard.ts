import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Constants } from '../../../../core/constants';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authHeader: string | undefined = request.headers.authorization;
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorised',
      });
    }

    const base64Credentials: string = authHeader.split(' ')[1];
    const credentials: string = Buffer.from(
      base64Credentials,
      'base64',
    ).toString('utf-8');
    const [username, password] = credentials.split(':');

    const validUsername: string = Constants.CREDENTIALS.ADMIN_LOGIN!;
    const validPassword: string = Constants.CREDENTIALS.ADMIN_PASSWORD!;

    if (username === validUsername && password === validPassword) {
      return true;
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorised',
      });
    }
  }
}
