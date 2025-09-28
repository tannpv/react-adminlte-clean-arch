export class Category {
  constructor(
    public readonly id: number,
    public name: string,
    public parentId: number | null = null,
  ) {}

  clone(): Category {
    return new Category(this.id, this.name, this.parentId)
  }
}
