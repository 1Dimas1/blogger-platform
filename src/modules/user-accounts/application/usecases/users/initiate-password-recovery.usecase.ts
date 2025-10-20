import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserDocument } from '../../../domain/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Constants } from '../../../../../core/constants';
import { PasswordRecoveryInitiatedEvent } from '../../../domain/events/password-recovery-initiated.event';

export class InitiatePasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(InitiatePasswordRecoveryCommand)
export class InitiatePasswordRecoveryUseCase
  implements ICommandHandler<InitiatePasswordRecoveryCommand, void>
{
  constructor(
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ email }: InitiatePasswordRecoveryCommand): Promise<void> {
    const user: UserDocument | null =
      await this.usersRepository.findByEmail(email);

    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    const recoveryCode: string = uuidv4();
    const expirationDate: Date = Constants.PASSWORD_RECOVERY_CODE_EXP_DATE_1_H;

    user.setPasswordRecoveryCode(recoveryCode, expirationDate);
    await this.usersRepository.save(user);

    this.eventBus.publish(
      new PasswordRecoveryInitiatedEvent(user.email, recoveryCode),
    );
  }
}
