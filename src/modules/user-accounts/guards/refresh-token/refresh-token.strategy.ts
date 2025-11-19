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
          const token = request.cookies?.refreshToken;
          if (!token) {
            console.error('No refresh token found in cookies');
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
      passReqToCallback: false,
    });
  }

  async validate(
    payload: RefreshTokenContextDto,
  ): Promise<RefreshTokenContextDto> {
    if (!payload.id || !payload.deviceId || typeof payload.iat !== 'number') {
      throw new Error('Invalid refresh token payload');
    }
    return {
      id: payload.id,
      deviceId: payload.deviceId,
      iat: payload.iat,
    };
  }
}
