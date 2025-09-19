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
    return categories.map((category) => this.toResponse(category))
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

    const id = await this.categories.nextId()
    const category = new Category(id, name)
    const created = await this.categories.create(category)
    return this.toResponse(created)
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

    const updated = await this.categories.update(category)
    return this.toResponse(updated)
  }

  async remove(id: number): Promise<CategoryResponseDto> {
    const removed = await this.categories.remove(id)
    if (!removed) throw new NotFoundException({ message: 'Category not found' })
    return this.toResponse(removed)
  }

  private toResponse(category: Category): CategoryResponseDto {
    return { id: category.id, name: category.name }
  }
}

