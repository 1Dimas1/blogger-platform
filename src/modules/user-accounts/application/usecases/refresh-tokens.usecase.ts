import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDeviceDocument } from '../../domain/security-device.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { calculateExpirationDate } from '../../utils/calculate-expiration-date.utility';

export class RefreshTokensCommand {
  constructor(
    public dto: {
      userId: string;
      deviceId: string;
      iat: number;
    },
  ) {}
}

// TODO refactor RefreshTokensUseCase
@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private securityDevicesRepository: SecurityDevicesRepository,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: RefreshTokensCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const device: SecurityDeviceDocument | null =
      await this.securityDevicesRepository.findByDeviceId(dto.deviceId);

    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid session',
      });
    }

    if (device.userId.toString() !== dto.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Device does not belong to user',
      });
    }

    if (device.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token has expired',
      });
    }

    const lastActiveDateInSeconds: number = Math.floor(
      device.lastActiveDate.getTime() / 1000,
    );

    if (dto.iat !== lastActiveDateInSeconds) {
      device.makeDeleted();
      await this.securityDevicesRepository.save(device);

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Token reuse detected - session terminated',
      });
    }

    const newActiveDate = new Date();
    device.updateLastActiveDate(newActiveDate);

    // Update device expiration date to extend the session
    const newExpirationDate: Date = calculateExpirationDate(
      this.userAccountsConfig.refreshTokenExpireIn,
    );
    device.expirationDate = newExpirationDate;

    await this.securityDevicesRepository.save(device);

    const accessToken: string = this.accessTokenContext.sign({
      userId: dto.userId,
    });

    const refreshToken: string = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId: dto.deviceId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
