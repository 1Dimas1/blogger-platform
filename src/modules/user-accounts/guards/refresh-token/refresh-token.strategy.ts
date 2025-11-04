import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Constants } from '../../../../core/constants';
import { RefreshTokenContextDto } from '../dto/refresh-token-context.dto';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      jwtFromRequest: (req: Request): string | null => {
        if (!req || !req.cookies) return null;
        return req.cookies['refreshToken'] as string;
      },
      ignoreExpiration: false,
      secretOrKey: Constants.JWT.REFRESH_TOKEN_SECRET!,
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
