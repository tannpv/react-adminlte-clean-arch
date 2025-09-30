package messaging

import (
	"context"
	"encoding/json"
	"fmt"

	"go-apps/internal/config"

	"github.com/redis/go-redis/v9"
)

// Message represents a message in the queue
type Message struct {
	ID      string                 `json:"id"`
	Type    string                 `json:"type"`
	Payload map[string]interface{} `json:"payload"`
	Created int64                  `json:"created"`
}

// Publisher interface for publishing messages
type Publisher interface {
	Publish(ctx context.Context, topic string, message *Message) error
}

// Subscriber interface for subscribing to messages
type Subscriber interface {
	Subscribe(ctx context.Context, topic string, handler func(*Message) error) error
}

// RedisPublisher implements Publisher using Redis
type RedisPublisher struct {
	client *redis.Client
}

// RedisSubscriber implements Subscriber using Redis
type RedisSubscriber struct {
	client *redis.Client
}

// NewRedisPublisher creates a new Redis publisher
func NewRedisPublisher(cfg config.RedisConfig) (*RedisPublisher, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	// Test connection
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RedisPublisher{client: client}, nil
}

// NewRedisSubscriber creates a new Redis subscriber
func NewRedisSubscriber(cfg config.RedisConfig) (*RedisSubscriber, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	// Test connection
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RedisSubscriber{client: client}, nil
}

// Publish publishes a message to a topic
func (p *RedisPublisher) Publish(ctx context.Context, topic string, message *Message) error {
	data, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return p.client.Publish(ctx, topic, data).Err()
}

// Subscribe subscribes to messages from a topic
func (s *RedisSubscriber) Subscribe(ctx context.Context, topic string, handler func(*Message) error) error {
	pubsub := s.client.Subscribe(ctx, topic)
	defer pubsub.Close()

	ch := pubsub.Channel()

	for {
		select {
		case msg := <-ch:
			var message Message
			if err := json.Unmarshal([]byte(msg.Payload), &message); err != nil {
				return fmt.Errorf("failed to unmarshal message: %w", err)
			}

			if err := handler(&message); err != nil {
				return fmt.Errorf("failed to handle message: %w", err)
			}

		case <-ctx.Done():
			return ctx.Err()
		}
	}
}

// Close closes the Redis connection
func (p *RedisPublisher) Close() error {
	return p.client.Close()
}

// Close closes the Redis connection
func (s *RedisSubscriber) Close() error {
	return s.client.Close()
}
