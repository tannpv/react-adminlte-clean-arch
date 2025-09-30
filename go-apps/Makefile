# Go Microservice API Makefile

# Variables
APP_NAME=go-apps-api
BUILD_DIR=build
DOCKER_IMAGE=go-apps-api
DOCKER_TAG=latest

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=$(APP_NAME)
BINARY_UNIX=$(BINARY_NAME)_unix

# Default target
.PHONY: all
all: clean build

# Build the application
.PHONY: build
build:
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) -v ./cmd/server

# Build for Linux
.PHONY: build-linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BUILD_DIR)/$(BINARY_UNIX) -v ./cmd/server

# Clean build artifacts
.PHONY: clean
clean:
	$(GOCLEAN)
	rm -rf $(BUILD_DIR)

# Run the application
.PHONY: run
run:
	$(GOCMD) run cmd/server/main.go

# Run with hot reload (requires air)
.PHONY: dev
dev:
	air

# Run tests
.PHONY: test
test:
	$(GOTEST) -v ./...

# Run tests with coverage
.PHONY: test-coverage
test-coverage:
	$(GOTEST) -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out

# Run tests with race detection
.PHONY: test-race
test-race:
	$(GOTEST) -race ./...

# Run benchmarks
.PHONY: bench
bench:
	$(GOTEST) -bench=. ./...

# Download dependencies
.PHONY: deps
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Update dependencies
.PHONY: deps-update
deps-update:
	$(GOMOD) download
	$(GOMOD) tidy
	$(GOGET) -u ./...

# Format code
.PHONY: fmt
fmt:
	$(GOCMD) fmt ./...

# Lint code (requires golangci-lint)
.PHONY: lint
lint:
	golangci-lint run

# Security scan (requires gosec)
.PHONY: security
security:
	gosec ./...

# Generate mocks (requires mockgen)
.PHONY: mocks
mocks:
	mockgen -source=internal/modules/users/repository/user_repository.go -destination=internal/modules/users/mocks/user_repository_mock.go
	mockgen -source=internal/modules/users/repository/role_repository.go -destination=internal/modules/users/mocks/role_repository_mock.go

# Database migrations
.PHONY: migrate-up
migrate-up:
	$(GOCMD) run cmd/migrate/main.go -action=up

.PHONY: migrate-down
migrate-down:
	$(GOCMD) run cmd/migrate/main.go -action=down

.PHONY: migrate-reset
migrate-reset:
	$(GOCMD) run cmd/migrate/main.go -action=reset

# Database seeding
.PHONY: seed
seed:
	$(GOCMD) run cmd/seed/main.go -action=seed

.PHONY: seed-clear
seed-clear:
	$(GOCMD) run cmd/seed/main.go -action=clear

.PHONY: seed-reset
seed-reset:
	$(GOCMD) run cmd/seed/main.go -action=reset

# Setup database (migrate + seed)
.PHONY: db-setup
db-setup: migrate-up seed

.PHONY: db-reset
db-reset: migrate-reset seed-reset

# Docker commands
.PHONY: docker-build
docker-build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

.PHONY: docker-run
docker-run:
	docker run -p 3001:3001 --env-file .env $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-push
docker-push:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

# Docker Compose
.PHONY: compose-up
compose-up:
	docker-compose up -d

.PHONY: compose-down
compose-down:
	docker-compose down

.PHONY: compose-logs
compose-logs:
	docker-compose logs -f

# Development setup
.PHONY: setup
setup: deps
	@echo "Setting up development environment..."
	@if [ ! -f .env ]; then cp env.example .env; fi
	@echo "Development environment setup complete!"

# Install development tools
.PHONY: install-tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	go install github.com/golang/mock/mockgen@latest
	@echo "Development tools installed!"

# Generate API documentation
.PHONY: docs
docs:
	swag init -g cmd/server/main.go -o docs/

# Health check
.PHONY: health
health:
	curl -f http://localhost:3001/health || exit 1

# Load test (requires hey)
.PHONY: load-test
load-test:
	hey -n 1000 -c 10 http://localhost:3001/api/v1/users

# Profiling
.PHONY: profile
profile:
	$(GOCMD) run cmd/server/main.go &
	sleep 5
	curl http://localhost:3001/debug/pprof/profile > profile.out
	$(GOCMD) tool pprof profile.out

# Help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  build          - Build the application"
	@echo "  build-linux    - Build for Linux"
	@echo "  clean          - Clean build artifacts"
	@echo "  run            - Run the application"
	@echo "  dev            - Run with hot reload"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  test-race      - Run tests with race detection"
	@echo "  bench          - Run benchmarks"
	@echo "  deps           - Download dependencies"
	@echo "  deps-update    - Update dependencies"
	@echo "  fmt            - Format code"
	@echo "  lint           - Lint code"
	@echo "  security       - Security scan"
	@echo "  mocks          - Generate mocks"
	@echo "  migrate-up     - Run database migrations up"
	@echo "  migrate-down   - Run database migrations down"
	@echo "  migrate-reset  - Reset database migrations"
	@echo "  seed           - Seed initial data"
	@echo "  seed-clear     - Clear seed data"
	@echo "  seed-reset     - Reset seed data"
	@echo "  db-setup       - Setup database (migrate + seed)"
	@echo "  db-reset       - Reset database (migrate + seed)"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  docker-push    - Push Docker image"
	@echo "  compose-up     - Start Docker Compose"
	@echo "  compose-down   - Stop Docker Compose"
	@echo "  compose-logs   - Show Docker Compose logs"
	@echo "  setup          - Setup development environment"
	@echo "  install-tools  - Install development tools"
	@echo "  docs           - Generate API documentation"
	@echo "  health         - Health check"
	@echo "  load-test      - Load test"
	@echo "  profile        - Profile the application"
	@echo "  help           - Show this help"
