import { Inject } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import Session from 'src/domain/aggregates/Session';
import ISessionRepository, { ISessionRepositorySymbol } from 'src/domain/repositories/ISessionRepository';
import { CreateSessionCommand } from '../commands/CreateSessionCommand';
import { DeleteSessionCommand } from '../commands/DeleteSessionCommand';

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionCommandHandler
  implements ICommandHandler<DeleteSessionCommand>
{
  constructor(
    @Inject(ISessionRepositorySymbol)
    private repository: ISessionRepository,
  ) {}

  async execute(command: DeleteSessionCommand) {
    const session = await this.repository.findSession(
      command.title,
      command.sessionId,
    );

    if (session) {
      session.delete();
      this.repository.save(session);

      const qosPath = join(
        process.cwd(),
        'qos',
        session.titleId.toString(),
        session.id.value,
      );

      if (existsSync(qosPath)) {
        await unlink(qosPath);

        console.log("Deleted session: " + session.id.value);
      }
    }
  }
}
