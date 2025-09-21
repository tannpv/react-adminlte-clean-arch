package events

import (
	"reflect"
	"sync"
)

// EventBus defines the interface for publishing and subscribing to domain events
type EventBus interface {
	Publish(topic string, args ...interface{})
	Subscribe(topic string, fn interface{}) error
	Unsubscribe(topic string, fn interface{}) error
}

// InMemoryEventBus is a simple in-memory implementation of EventBus
type InMemoryEventBus struct {
	subscribers map[string][]interface{}
	mutex       sync.RWMutex
}

// NewInMemoryEventBus creates a new in-memory event bus
func NewInMemoryEventBus() EventBus {
	return &InMemoryEventBus{
		subscribers: make(map[string][]interface{}),
	}
}

// Publish publishes an event to all subscribers
func (b *InMemoryEventBus) Publish(topic string, args ...interface{}) {
	b.mutex.RLock()
	handlers := b.subscribers[topic]
	b.mutex.RUnlock()

	for _, handler := range handlers {
		// Call the handler function
		handlerValue := reflect.ValueOf(handler)

		if handlerValue.Kind() == reflect.Func {
			// Convert args to reflect.Value slice
			argValues := make([]reflect.Value, len(args))
			for i, arg := range args {
				argValues[i] = reflect.ValueOf(arg)
			}
			handlerValue.Call(argValues)
		}
	}
}

// Subscribe subscribes to an event type
func (b *InMemoryEventBus) Subscribe(topic string, fn interface{}) error {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	b.subscribers[topic] = append(b.subscribers[topic], fn)
	return nil
}

// Unsubscribe unsubscribes from an event type
func (b *InMemoryEventBus) Unsubscribe(topic string, fn interface{}) error {
	b.mutex.Lock()
	defer b.mutex.Unlock()

	handlers := b.subscribers[topic]
	for i, h := range handlers {
		if reflect.DeepEqual(h, fn) {
			b.subscribers[topic] = append(handlers[:i], handlers[i+1:]...)
			break
		}
	}
	return nil
}

// DomainEventBus wraps the EventBus for domain events
type DomainEventBus struct {
	bus EventBus
}

// NewDomainEventBus creates a new domain event bus
func NewDomainEventBus() *DomainEventBus {
	return &DomainEventBus{
		bus: NewInMemoryEventBus(),
	}
}

// Publish publishes a domain event
func (eb *DomainEventBus) Publish(topic string, args ...interface{}) {
	eb.bus.Publish(topic, args...)
}

// Subscribe subscribes to a domain event
func (eb *DomainEventBus) Subscribe(topic string, fn interface{}) error {
	return eb.bus.Subscribe(topic, fn)
}

// Unsubscribe unsubscribes from a domain event
func (eb *DomainEventBus) Unsubscribe(topic string, fn interface{}) error {
	return eb.bus.Unsubscribe(topic, fn)
}
