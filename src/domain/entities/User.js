export class User {
  constructor({ id, name, email, roles = [] }) {
    this.id = id
    this.name = name
    this.email = email
    this.roles = roles
  }
}
