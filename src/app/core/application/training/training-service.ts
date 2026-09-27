import { DogRepository } from '../../domain/dog/dog.repository';
import { TrainingSession, validateSession } from '../../domain/training/training';
import { TrainingSessionRepository } from '../../domain/training/training-session.repository';
export class TrainingService {
  constructor(
    private readonly dogs: DogRepository,
    private readonly sessions: TrainingSessionRepository,
  ) {}
  async save(session: TrainingSession): Promise<void> {
    validateSession(session);
    if (!(await this.dogs.findById(session.dogId)))
      throw new Error('Der ausgewählte Hund existiert nicht.');
    await this.sessions.save(session);
  }
}
