package services

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/application/mappers"
	"github.com/southern-martin/go-microservice/internal/domain/events"
	"github.com/southern-martin/go-microservice/internal/domain/repositories"
	"github.com/southern-martin/go-microservice/internal/domain/services"
)

type UserApplicationService struct {
	userRepo      repositories.UserRepository
	userDomainSvc *services.UserDomainService
	eventBus      events.EventBus
	jwtSecret     string
	jwtExpiresIn  time.Duration
}

func NewUserApplicationService(
	userRepo repositories.UserRepository,
	userDomainSvc *services.UserDomainService,
	eventBus events.EventBus,
	jwtSecret string,
	jwtExpiresIn time.Duration,
) *UserApplicationService {
	return &UserApplicationService{
		userRepo:      userRepo,
		userDomainSvc: userDomainSvc,
		eventBus:      eventBus,
		jwtSecret:     jwtSecret,
		jwtExpiresIn:  jwtExpiresIn,
	}
}

func (s *UserApplicationService) CreateUser(ctx context.Context, req *dto.CreateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userDomainSvc.CreateUser(ctx, req.Email, req.Name, req.Password)
	if err != nil {
		return nil, err
	}

	// Publish domain event
	s.eventBus.Publish("user.created", &events.UserCreatedEvent{
		UserID:    user.ID,
		Email:     user.Email,
		Name:      user.Name,
		CreatedAt: user.CreatedAt,
	})

	return mappers.UserToResponse(user), nil
}

func (s *UserApplicationService) GetUser(ctx context.Context, userID uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return mappers.UserToResponse(user), nil
}

func (s *UserApplicationService) UpdateUser(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	mappers.UpdateUserRequestToEntity(req, user)

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	// Publish domain event
	s.eventBus.Publish("user.updated", &events.UserUpdatedEvent{
		UserID:    user.ID,
		Email:     user.Email,
		Name:      user.Name,
		UpdatedAt: user.UpdatedAt,
	})

	return mappers.UserToResponse(user), nil
}

func (s *UserApplicationService) DeleteUser(ctx context.Context, userID uuid.UUID) error {
	if err := s.userRepo.Delete(ctx, userID); err != nil {
		return err
	}

	// Publish domain event
	s.eventBus.Publish("user.deleted", &events.UserDeletedEvent{
		UserID:    userID,
		DeletedAt: time.Now(),
	})

	return nil
}

func (s *UserApplicationService) ListUsers(ctx context.Context, page, limit int, search string) (*dto.UserListResponse, error) {
	offset := (page - 1) * limit

	users, err := s.userRepo.List(ctx, limit, offset, search)
	if err != nil {
		return nil, err
	}

	total, err := s.userRepo.Count(ctx, search)
	if err != nil {
		return nil, err
	}

	userResponses := mappers.UsersToResponse(users)

	return &dto.UserListResponse{
		Users: userResponses,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

func (s *UserApplicationService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !s.userDomainSvc.ValidatePassword(user, req.Password) {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive() {
		return nil, errors.New("user account is inactive")
	}

	token, err := s.generateJWT(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User:  *mappers.UserToResponse(user),
	}, nil
}

func (s *UserApplicationService) ChangePassword(ctx context.Context, userID uuid.UUID, req *dto.ChangePasswordRequest) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	if !s.userDomainSvc.ValidatePassword(user, req.CurrentPassword) {
		return errors.New("current password is incorrect")
	}

	return s.userDomainSvc.ChangePassword(ctx, userID, req.NewPassword)
}

func (s *UserApplicationService) UpdateUserStatus(ctx context.Context, userID uuid.UUID, req *dto.UpdateUserStatusRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	oldStatus := user.Status

	switch req.Status {
	case "active":
		err = s.userDomainSvc.ActivateUser(ctx, userID)
	case "inactive":
		err = s.userDomainSvc.DeactivateUser(ctx, userID)
	case "blocked":
		err = s.userDomainSvc.BlockUser(ctx, userID)
	default:
		return nil, errors.New("invalid status")
	}

	if err != nil {
		return nil, err
	}

	// Get updated user
	user, err = s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Publish status change event
	s.eventBus.Publish("user.status_changed", &events.UserStatusChangedEvent{
		UserID:    userID,
		OldStatus: oldStatus,
		NewStatus: user.Status,
		ChangedAt: time.Now(),
	})

	return mappers.UserToResponse(user), nil
}

func (s *UserApplicationService) generateJWT(userID uuid.UUID, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"email":   email,
		"exp":     time.Now().Add(s.jwtExpiresIn).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
