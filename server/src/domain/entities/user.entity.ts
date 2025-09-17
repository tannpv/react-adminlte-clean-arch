export interface PublicUser {
  id: number
  name: string
  email: string
  roles: number[]
}

export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public roles: number[],
    public passwordHash: string,
  ) {}

  toPublic(): PublicUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      roles: [...this.roles],
    }
  }

  clone(): User {
    return new User(this.id, this.name, this.email, [...this.roles], this.passwordHash)
  }
}
