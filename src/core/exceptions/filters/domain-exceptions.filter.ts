import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { Request, Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';
// import { ErrorResponseBody } from './error-response-body.type';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Constants } from '../../constants';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const response: Response = ctx.getResponse<Response>();
    const request: Request = ctx.getRequest<Request>();

    const status: number = this.mapToHttpStatus(exception.code);
    // ErrorResponseBody should be here in the feature
    const responseBody = this.buildResponseBody(exception, request.url);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(exception: DomainException, requestUrl: string) {
    const isProduction: boolean = Constants.ENVIRONMENT === 'production';

    if (isProduction) {
      return {
        errorsMessages: exception.extensions,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message: exception.message,
      code: exception.code,
      extensions: exception.extensions,
    };
  }
}
