import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CATEGORY_REPOSITORY, CategoryRepository } from '../../domain/repositories/category.repository'
import { Category } from '../../domain/entities/category.entity'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { validationException } from '../../shared/validation-error'
import { CategoryResponseDto } from '../dto/category-response.dto'

@Injectable()
export class CategoriesService {
  constructor(@Inject(CATEGORY_REPOSITORY) private readonly categories: CategoryRepository) {}

  async list(): Promise<CategoryResponseDto[]> {
    const categories = await this.categories.findAll()
    const byId = new Map(categories.map((category) => [category.id, category]))
    return categories.map((category) => {
      const parent = category.parentId ? byId.get(category.parentId) ?? null : null
      return this.toResponse(category, parent)
    })
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const name = dto.name.trim()
    if (!name) {
      throw validationException({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } })
    }

    const existing = await this.categories.findByName(name)
    if (existing) {
      throw validationException({ name: { code: 'NAME_EXISTS', message: 'Category name already exists' } })
    }

    const parent = await this.validateParent(dto.parentId ?? null)
    const parentId = parent?.id ?? null
    const id = await this.categories.nextId()
    const category = new Category(id, name, parentId)
    const created = await this.categories.create(category)
    return this.toResponse(created, parent)
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categories.findById(id)
    if (!category) throw new NotFoundException({ message: 'Category not found' })

    if (dto.name !== undefined) {
      const name = dto.name.trim()
      if (!name) {
        throw validationException({ name: { code: 'NAME_REQUIRED', message: 'Name is required' } })
      }
      const existing = await this.categories.findByName(name)
      if (existing && existing.id !== id) {
        throw validationException({ name: { code: 'NAME_EXISTS', message: 'Category name already exists' } })
      }
      category.name = name
    }

    let parent: Category | null = null
    if (dto.parentId !== undefined) {
      parent = await this.validateParent(dto.parentId ?? null, id)
      category.parentId = parent?.id ?? null
    } else {
      parent = category.parentId ? await this.categories.findById(category.parentId) : null
    }

    const updated = await this.categories.update(category)
    return this.toResponse(updated, parent)
  }

  async remove(id: number): Promise<CategoryResponseDto> {
    const removed = await this.categories.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Category not found' })
    const parent = removed.parentId ? await this.categories.findById(removed.parentId) : null
    return this.toResponse(removed, parent)
  }

  private toResponse(category: Category, parent: Category | null): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId ?? null,
      parentName: parent?.name ?? null,
    }
  }

  private async validateParent(parentId: number | null, currentId?: number): Promise<Category | null> {
    if (parentId === null || parentId === undefined) {
      return null
    }

    if (currentId !== undefined && parentId === currentId) {
      throw validationException({ parentId: { code: 'INVALID_PARENT', message: 'Category cannot be its own parent' } })
    }

    const parent = await this.categories.findById(parentId)
    if (!parent) {
      throw validationException({ parentId: { code: 'PARENT_NOT_FOUND', message: 'Parent category not found' } })
    }

    if (currentId !== undefined) {
      const visited = new Set<number>()
      let cursor: Category | null = parent
      while (cursor) {
        if (visited.has(cursor.id)) break
        visited.add(cursor.id)
        if (cursor.parentId === null || cursor.parentId === undefined) break
        if (cursor.parentId === currentId) {
          throw validationException({ parentId: { code: 'INVALID_PARENT', message: 'Cannot set a descendant as parent' } })
        }
        cursor = await this.categories.findById(cursor.parentId)
      }
    }

    return parent
  }
}
