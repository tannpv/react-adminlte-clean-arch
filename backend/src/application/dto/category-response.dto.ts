export interface CategoryResponseDto {
  id: number
  name: string
  parentId: number | null
  parentName: string | null
}

export interface CategoryHierarchyOptionDto {
  id: number
  label: string
  disabled: boolean
}
