import { DomainEvent } from '../../../../shared/kernel';

export class UserRoleAssignedEvent extends DomainEvent {
  constructor(
    public readonly userId: number,
    public readonly roleId: number,
    public readonly roleName: string,
    public readonly assignedBy: number,
  ) {
    super();
  }
}
