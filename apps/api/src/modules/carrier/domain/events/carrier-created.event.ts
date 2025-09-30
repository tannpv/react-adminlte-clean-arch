import { DomainEvent } from '../../../../shared/kernel';

export class CarrierCreatedEvent extends DomainEvent {
  constructor(
    public readonly carrierId: number,
    public readonly carrierName: string,
    public readonly createdBy: number,
  ) {
    super();
  }
}
