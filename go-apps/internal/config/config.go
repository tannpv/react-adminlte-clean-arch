package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	Port     int           `json:"port"`
	Env      string        `json:"env"`
	LogLevel string        `json:"log_level"`
	Database DatabaseConfig `json:"database"`
	JWT      JWTConfig     `json:"jwt"`
	Redis    RedisConfig   `json:"redis"`
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host         string        `json:"host"`
	Port         int           `json:"port"`
	User         string        `json:"user"`
	Password     string        `json:"password"`
	DBName       string        `json:"db_name"`
	SSLMode      string        `json:"ssl_mode"`
	MaxOpenConns int           `json:"max_open_conns"`
	MaxIdleConns int           `json:"max_idle_conns"`
	MaxLifetime  time.Duration `json:"max_lifetime"`
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret     string        `json:"secret"`
	Expiration time.Duration `json:"expiration"`
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Password string `json:"password"`
	DB       int    `json:"db"`
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	config := &Config{
		Port:     getEnvAsInt("APP_PORT", 3001),
		Env:      getEnv("NODE_ENV", "development"),
		LogLevel: getEnv("LOG_LEVEL", "info"),
		Database: DatabaseConfig{
			Host:         getEnv("DATABASE_HOST", "localhost"),
			Port:         getEnvAsInt("DATABASE_PORT", 3306),
			User:         getEnv("DATABASE_USERNAME", "root"),
			Password:     getEnv("DATABASE_PASSWORD", "password"),
			DBName:       getEnv("DATABASE_NAME", "go_microservice_db"),
			SSLMode:      getEnv("DATABASE_SSL_MODE", "disable"),
			MaxOpenConns: getEnvAsInt("DATABASE_MAX_OPEN_CONNS", 25),
			MaxIdleConns: getEnvAsInt("DATABASE_MAX_IDLE_CONNS", 25),
			MaxLifetime:  time.Duration(getEnvAsInt("DATABASE_MAX_LIFETIME", 5)) * time.Minute,
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key"),
			Expiration: time.Duration(getEnvAsInt("JWT_EXPIRATION", 24)) * time.Hour,
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnvAsInt("REDIS_PORT", 6379),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
	}

	return config, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt gets an environment variable as integer or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// IsDevelopment returns true if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if the environment is production
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}
