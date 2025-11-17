import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDeviceDocument } from '../../domain/security-device.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class LogoutUserCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({ deviceId }: LogoutUserCommand): Promise<void> {
    const device: SecurityDeviceDocument | null =
      await this.securityDevicesRepository.findByDeviceId(deviceId);

    if (!device) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid session',
      });
    }

    device.makeDeleted();
    await this.securityDevicesRepository.save(device);
  }
}
