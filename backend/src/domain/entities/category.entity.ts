export class Category {
  constructor(
    public readonly id: number,
    public name: string,
  ) {}

  clone(): Category {
    return new Category(this.id, this.name)
  }
}

