export interface CategoryResponseDto {
  id: number
  name: string
  parentId: number | null
  parentName: string | null
}
