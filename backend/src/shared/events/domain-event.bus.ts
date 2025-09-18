import { Injectable, Logger } from '@nestjs/common'
import { DomainEvent, DomainEventHandler } from '../../domain/events/domain-event'

type HandlerMap = Map<string, Set<DomainEventHandler>>

@Injectable()
export class DomainEventBus {
  private readonly handlers: HandlerMap = new Map()
  private readonly logger = new Logger(DomainEventBus.name)

  publish<T extends DomainEvent>(event: T): void {
    const { name } = event
    const subscribers = this.handlers.get(name)
    if (!subscribers?.size) {
      this.logger.debug?.(`No subscribers for event ${name}`)
      return
    }

    subscribers.forEach((handler) => {
      try {
        const maybePromise = handler(event)
        if (maybePromise instanceof Promise) {
          maybePromise.catch((err) => this.logger.error(`Handler for ${name} rejected`, err?.stack || err))
        }
      } catch (err: any) {
        this.logger.error(`Handler for ${name} threw`, err?.stack || err)
      }
    })
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    events.forEach((event) => this.publish(event))
  }

  subscribe(eventName: string, handler: DomainEventHandler): () => void {
    const existing = this.handlers.get(eventName)
    if (existing) {
      existing.add(handler)
    } else {
      this.handlers.set(eventName, new Set([handler]))
    }

    return () => {
      const handlers = this.handlers.get(eventName)
      handlers?.delete(handler)
      if (handlers && handlers.size === 0) {
        this.handlers.delete(eventName)
      }
    }
  }
}
