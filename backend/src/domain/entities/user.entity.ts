import { UserProfile, PublicUserProfile } from './user-profile.entity'

export interface PublicUser {
  id: number
  email: string
  roles: number[]
  profile: PublicUserProfile | null
}

export class User {
  constructor(
    public readonly id: number,
    public email: string,
    public roles: number[],
    public passwordHash: string,
    private _profile: UserProfile | null = null,
  ) {}

  get profile(): UserProfile | null {
    return this._profile ? this._profile.clone() : null
  }

  set profile(profile: UserProfile | null) {
    this._profile = profile ? profile.clone() : null
  }

  toPublic(): PublicUser {
    return {
      id: this.id,
      email: this.email,
      roles: [...this.roles],
      profile: this._profile
        ? {
            firstName: this._profile.firstName,
            lastName: this._profile.lastName,
            dateOfBirth: this._profile.dateOfBirth ? this._profile.dateOfBirth.toISOString().split('T')[0] : null,
            pictureUrl: this._profile.pictureUrl,
          }
        : null,
    }
  }

  clone(): User {
    return new User(
      this.id,
      this.email,
      [...this.roles],
      this.passwordHash,
      this._profile ? this._profile.clone() : null,
    )
  }
}

