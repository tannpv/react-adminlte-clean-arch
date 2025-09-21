package services

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
	"github.com/southern-martin/go-microservice/internal/domain/repositories"
	"golang.org/x/crypto/bcrypt"
)

type UserDomainService struct {
	userRepo repositories.UserRepository
}

func NewUserDomainService(userRepo repositories.UserRepository) *UserDomainService {
	return &UserDomainService{
		userRepo: userRepo,
	}
}

func (s *UserDomainService) CreateUser(ctx context.Context, email, name, password string) (*entities.User, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &entities.User{
		ID:       uuid.New(),
		Email:    email,
		Name:     name,
		Password: string(hashedPassword),
		Status:   string(entities.UserStatusActive),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserDomainService) ValidatePassword(user *entities.User, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

func (s *UserDomainService) ActivateUser(ctx context.Context, userID uuid.UUID) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	user.SetStatus(entities.UserStatusActive)
	return s.userRepo.Update(ctx, user)
}

func (s *UserDomainService) DeactivateUser(ctx context.Context, userID uuid.UUID) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	user.SetStatus(entities.UserStatusInactive)
	return s.userRepo.Update(ctx, user)
}

func (s *UserDomainService) BlockUser(ctx context.Context, userID uuid.UUID) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	user.SetStatus(entities.UserStatusBlocked)
	return s.userRepo.Update(ctx, user)
}

func (s *UserDomainService) ChangePassword(ctx context.Context, userID uuid.UUID, newPassword string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.userRepo.Update(ctx, user)
}
