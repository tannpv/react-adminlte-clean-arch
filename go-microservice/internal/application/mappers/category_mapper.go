package mappers

import (
	"github.com/southern-martin/go-microservice/internal/application/dto"
	"github.com/southern-martin/go-microservice/internal/domain/entities"
)

func CategoryToResponse(category *entities.Category) *dto.CategoryResponse {
	if category == nil {
		return nil
	}

	response := &dto.CategoryResponse{
		ID:        category.ID,
		Name:      category.Name,
		ParentID:  category.ParentID,
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
	}

	// Map parent if present
	if category.Parent != nil {
		response.Parent = &dto.CategoryInfo{
			ID:   category.Parent.ID,
			Name: category.Parent.Name,
		}
	}

	// Map children if present
	if len(category.Children) > 0 {
		response.Children = make([]dto.CategoryResponse, len(category.Children))
		for i, child := range category.Children {
			response.Children[i] = *CategoryToResponse(&child)
		}
	}

	return response
}

func CategoriesToResponse(categories []*entities.Category) []dto.CategoryResponse {
	responses := make([]dto.CategoryResponse, len(categories))
	for i, category := range categories {
		responses[i] = *CategoryToResponse(category)
	}
	return responses
}

func CreateCategoryRequestToEntity(req *dto.CreateCategoryRequest) *entities.Category {
	return &entities.Category{
		Name:     req.Name,
		ParentID: req.ParentID,
	}
}

func UpdateCategoryRequestToEntity(req *dto.UpdateCategoryRequest, category *entities.Category) {
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.ParentID != nil {
		category.ParentID = req.ParentID
	}
}

func BuildCategoryTree(categories []*entities.Category) []dto.CategoryTreeNode {
	categoryMap := make(map[string]*entities.Category)
	var rootCategories []*entities.Category

	// Build category map
	for _, category := range categories {
		categoryMap[category.ID.String()] = category
	}

	// Find root categories and build tree
	for _, category := range categories {
		if category.ParentID == nil {
			rootCategories = append(rootCategories, category)
		}
	}

	return buildTreeNode(rootCategories, categoryMap, 0)
}

func buildTreeNode(categories []*entities.Category, categoryMap map[string]*entities.Category, depth int) []dto.CategoryTreeNode {
	var nodes []dto.CategoryTreeNode

	for _, category := range categories {
		node := dto.CategoryTreeNode{
			ID:       category.ID,
			Name:     category.Name,
			ParentID: category.ParentID,
			Depth:    depth,
			Disabled: false,
		}

		// Find children
		var children []*entities.Category
		for _, cat := range categoryMap {
			if cat.ParentID != nil && cat.ParentID.String() == category.ID.String() {
				children = append(children, cat)
			}
		}

		if len(children) > 0 {
			node.Children = buildTreeNode(children, categoryMap, depth+1)
		}

		nodes = append(nodes, node)
	}

	return nodes
}
