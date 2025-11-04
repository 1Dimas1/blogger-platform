import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { SecurityDeviceDocument } from '../../domain/security-device.entity';

export class LogoutUserCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({ deviceId }: LogoutUserCommand): Promise<void> {
    const device: SecurityDeviceDocument =
      await this.securityDevicesRepository.findOrNotFoundFail(deviceId);

    device.makeDeleted();
    await this.securityDevicesRepository.save(device);
  }
}
