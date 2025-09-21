package config

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"time"
)

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret         string        `mapstructure:"secret"`
	ExpiresIn      time.Duration `mapstructure:"expires_in"`
	Algorithm      string        `mapstructure:"algorithm"`
	PrivateKeyPath string        `mapstructure:"private_key_path"`
	PublicKeyPath  string        `mapstructure:"public_key_path"`
	AuthServiceURL string        `mapstructure:"auth_service_url"`
	Issuer         string        `mapstructure:"issuer"`
	Audience       string        `mapstructure:"audience"`
}

// LoadJWTConfig loads JWT configuration with defaults
func LoadJWTConfig() *JWTConfig {
	return &JWTConfig{
		Secret:         getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		ExpiresIn:      getEnvDuration("JWT_EXPIRES_IN", "24h"),
		Algorithm:      getEnv("JWT_ALGORITHM", "HS256"),
		PrivateKeyPath: getEnv("JWT_PRIVATE_KEY_PATH", ""),
		PublicKeyPath:  getEnv("JWT_PUBLIC_KEY_PATH", ""),
		AuthServiceURL: getEnv("AUTH_SERVICE_URL", ""),
		Issuer:         getEnv("JWT_ISSUER", "southern-martin-auth"),
		Audience:       getEnv("JWT_AUDIENCE", "southern-martin-apis"),
	}
}

// LoadRSAPrivateKey loads RSA private key from file
func (c *JWTConfig) LoadRSAPrivateKey() (*rsa.PrivateKey, error) {
	if c.PrivateKeyPath == "" {
		return nil, fmt.Errorf("private key path not configured")
	}

	keyData, err := os.ReadFile(c.PrivateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read private key file: %w", err)
	}

	block, _ := pem.Decode(keyData)
	if block == nil {
		return nil, fmt.Errorf("failed to parse PEM block")
	}

	priv, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	return priv, nil
}

// LoadRSAPublicKey loads RSA public key from file
func (c *JWTConfig) LoadRSAPublicKey() (*rsa.PublicKey, error) {
	if c.PublicKeyPath == "" {
		return nil, fmt.Errorf("public key path not configured")
	}

	keyData, err := os.ReadFile(c.PublicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read public key file: %w", err)
	}

	block, _ := pem.Decode(keyData)
	if block == nil {
		return nil, fmt.Errorf("failed to parse PEM block")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse public key: %w", err)
	}

	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an RSA public key")
	}

	return rsaPub, nil
}

// IsCentralizedAuth returns true if using centralized authentication
func (c *JWTConfig) IsCentralizedAuth() bool {
	return c.AuthServiceURL != ""
}

// IsRSAAlgorithm returns true if using RSA algorithm
func (c *JWTConfig) IsRSAAlgorithm() bool {
	return c.Algorithm == "RS256"
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvDuration(key, defaultValue string) time.Duration {
	value := getEnv(key, defaultValue)
	duration, err := time.ParseDuration(value)
	if err != nil {
		// Fallback to default
		duration, _ = time.ParseDuration(defaultValue)
	}
	return duration
}
