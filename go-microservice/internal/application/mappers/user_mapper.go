package mappers

import (
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

func UserToResponse(user *entities.User) *dto.UserResponse {
	if user == nil {
		return nil
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Status:    user.Status,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

func UsersToResponse(users []*entities.User) []dto.UserResponse {
	responses := make([]dto.UserResponse, len(users))
	for i, user := range users {
		responses[i] = *UserToResponse(user)
	}
	return responses
}

func CreateUserRequestToEntity(req *dto.CreateUserRequest) *entities.User {
	return &entities.User{
		Email:    req.Email,
		Name:     req.Name,
		Password: req.Password, // Will be hashed in domain service
	}
}

func UpdateUserRequestToEntity(req *dto.UpdateUserRequest, user *entities.User) {
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
}
