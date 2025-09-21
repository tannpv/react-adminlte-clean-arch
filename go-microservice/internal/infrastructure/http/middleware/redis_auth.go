package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

// RedisAuthMiddleware handles JWT authentication with Redis session storage
type RedisAuthMiddleware struct {
	redisClient *redis.Client
	jwtSecret   string
}

// SessionData represents user session data stored in Redis
type SessionData struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Roles     []string  `json:"roles"`
	CreatedAt time.Time `json:"created_at"`
	LastSeen  time.Time `json:"last_seen"`
}

// NewRedisAuthMiddleware creates a new Redis-based auth middleware
func NewRedisAuthMiddleware(redisClient *redis.Client, jwtSecret string) *RedisAuthMiddleware {
	return &RedisAuthMiddleware{
		redisClient: redisClient,
		jwtSecret:   jwtSecret,
	}
}

// AuthMiddleware returns the Gin middleware function
func (r *RedisAuthMiddleware) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization header format",
			})
			c.Abort()
			return
		}

		// Parse and validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(r.jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token claims",
			})
			c.Abort()
			return
		}

		// Get session ID from token
		sessionID, ok := claims["session_id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid session ID",
			})
			c.Abort()
			return
		}

		// Check if session exists in Redis
		sessionData, err := r.getSessionFromRedis(sessionID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Session not found or expired",
			})
			c.Abort()
			return
		}

		// Update last seen timestamp
		go r.updateLastSeen(sessionID)

		// Add user info to context
		c.Set("user_id", sessionData.UserID)
		c.Set("email", sessionData.Email)
		c.Set("name", sessionData.Name)
		c.Set("roles", sessionData.Roles)
		c.Set("session_id", sessionID)

		c.Next()
	}
}

// getSessionFromRedis retrieves session data from Redis
func (r *RedisAuthMiddleware) getSessionFromRedis(sessionID string) (*SessionData, error) {
	ctx := context.Background()

	// Get session data from Redis
	sessionJSON, err := r.redisClient.Get(ctx, "session:"+sessionID).Result()
	if err != nil {
		return nil, err
	}

	// Parse session data
	var sessionData SessionData
	if err := json.Unmarshal([]byte(sessionJSON), &sessionData); err != nil {
		return nil, err
	}

	return &sessionData, nil
}

// updateLastSeen updates the last seen timestamp for the session
func (r *RedisAuthMiddleware) updateLastSeen(sessionID string) {
	ctx := context.Background()

	// Get current session data
	sessionData, err := r.getSessionFromRedis(sessionID)
	if err != nil {
		return
	}

	// Update last seen timestamp
	sessionData.LastSeen = time.Now()

	// Store back to Redis
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return
	}

	// Update with same expiration time
	ttl := r.redisClient.TTL(ctx, "session:"+sessionID).Val()
	r.redisClient.Set(ctx, "session:"+sessionID, sessionJSON, ttl)
}

// CreateSession creates a new session in Redis
func (r *RedisAuthMiddleware) CreateSession(userID, email, name string, roles []string, expiresIn time.Duration) (string, error) {
	ctx := context.Background()

	// Generate session ID
	sessionID := generateSessionID()

	// Create session data
	sessionData := SessionData{
		UserID:    userID,
		Email:     email,
		Name:      name,
		Roles:     roles,
		CreatedAt: time.Now(),
		LastSeen:  time.Now(),
	}

	// Marshal session data
	sessionJSON, err := json.Marshal(sessionData)
	if err != nil {
		return "", err
	}

	// Store in Redis with expiration
	err = r.redisClient.Set(ctx, "session:"+sessionID, sessionJSON, expiresIn).Err()
	if err != nil {
		return "", err
	}

	return sessionID, nil
}

// RevokeSession revokes a session by removing it from Redis
func (r *RedisAuthMiddleware) RevokeSession(sessionID string) error {
	ctx := context.Background()
	return r.redisClient.Del(ctx, "session:"+sessionID).Err()
}

// RevokeAllUserSessions revokes all sessions for a specific user
func (r *RedisAuthMiddleware) RevokeAllUserSessions(userID string) error {
	ctx := context.Background()

	// Find all sessions for the user
	pattern := "session:*"
	keys, err := r.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}

	// Check each session and delete if it belongs to the user
	for _, key := range keys {
		sessionJSON, err := r.redisClient.Get(ctx, key).Result()
		if err != nil {
			continue
		}

		var sessionData SessionData
		if err := json.Unmarshal([]byte(sessionJSON), &sessionData); err != nil {
			continue
		}

		if sessionData.UserID == userID {
			r.redisClient.Del(ctx, key)
		}
	}

	return nil
}

// GetActiveSessions returns all active sessions for a user
func (r *RedisAuthMiddleware) GetActiveSessions(userID string) ([]SessionData, error) {
	ctx := context.Background()

	pattern := "session:*"
	keys, err := r.redisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}

	var sessions []SessionData
	for _, key := range keys {
		sessionJSON, err := r.redisClient.Get(ctx, key).Result()
		if err != nil {
			continue
		}

		var sessionData SessionData
		if err := json.Unmarshal([]byte(sessionJSON), &sessionData); err != nil {
			continue
		}

		if sessionData.UserID == userID {
			sessions = append(sessions, sessionData)
		}
	}

	return sessions, nil
}

// generateSessionID generates a unique session ID
func generateSessionID() string {
	return fmt.Sprintf("sess_%d_%s", time.Now().UnixNano(), randomString(16))
}

// randomString generates a random string of specified length
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
