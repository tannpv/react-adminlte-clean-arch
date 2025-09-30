package kernel

import "time"

// DomainEvent represents a domain event
type DomainEvent interface {
	GetEventType() string
	GetAggregateID() string
	GetOccurredOn() time.Time
	GetEventData() map[string]interface{}
}

// BaseDomainEvent provides base implementation for domain events
type BaseDomainEvent struct {
	EventType   string                 `json:"event_type"`
	AggregateID string                 `json:"aggregate_id"`
	OccurredOn  time.Time              `json:"occurred_on"`
	EventData   map[string]interface{} `json:"event_data"`
}

// NewBaseDomainEvent creates a new base domain event
func NewBaseDomainEvent(eventType, aggregateID string, eventData map[string]interface{}) *BaseDomainEvent {
	return &BaseDomainEvent{
		EventType:   eventType,
		AggregateID: aggregateID,
		OccurredOn:  time.Now(),
		EventData:   eventData,
	}
}

// GetEventType returns the event type
func (e *BaseDomainEvent) GetEventType() string {
	return e.EventType
}

// GetAggregateID returns the aggregate ID
func (e *BaseDomainEvent) GetAggregateID() string {
	return e.AggregateID
}

// GetOccurredOn returns when the event occurred
func (e *BaseDomainEvent) GetOccurredOn() time.Time {
	return e.OccurredOn
}

// GetEventData returns the event data
func (e *BaseDomainEvent) GetEventData() map[string]interface{} {
	return e.EventData
}
