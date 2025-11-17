import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenContextDto } from '../dto/refresh-token-context.dto';
import { UserAccountsConfig } from '../../config/user-accounts.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies?.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }

  async validate(
    payload: RefreshTokenContextDto,
  ): Promise<RefreshTokenContextDto> {
    return {
      userId: payload.userId,
      deviceId: payload.deviceId,
      iat: payload.iat,
    };
  }
}
