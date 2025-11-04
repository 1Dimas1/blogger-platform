import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { Types } from 'mongoose';

export class TerminateAllOtherSessionsCommand {
  constructor(
    public dto: {
      userId: string;
      currentDeviceId: string;
    },
  ) {}
}

@CommandHandler(TerminateAllOtherSessionsCommand)
export class TerminateAllOtherSessionsUseCase
  implements ICommandHandler<TerminateAllOtherSessionsCommand>
{
  constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

  async execute({ dto }: TerminateAllOtherSessionsCommand): Promise<void> {
    await this.securityDevicesRepository.deleteAllUserDevicesExcept(
      new Types.ObjectId(dto.userId),
      dto.currentDeviceId,
    );
  }
}
