import { DomainEvent } from '../../../../shared/kernel';

export class UserUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: number,
    public readonly userEmail: string,
    public readonly changes: Record<string, any>,
    public readonly updatedBy: number,
  ) {
    super();
  }
}
