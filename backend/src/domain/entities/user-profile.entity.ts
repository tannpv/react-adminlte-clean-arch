export interface UserProfileProps {
  userId: number
  firstName: string
  lastName: string | null
  dateOfBirth: Date | null
  pictureUrl: string | null
}

export class UserProfile {
  constructor(private props: UserProfileProps) {}

  get userId() { return this.props.userId }

  get firstName() { return this.props.firstName }
  set firstName(value: string) { this.props.firstName = value }

  get lastName() { return this.props.lastName }
  set lastName(value: string | null) { this.props.lastName = value ?? null }

  get dateOfBirth() { return this.props.dateOfBirth }
  set dateOfBirth(value: Date | null) { this.props.dateOfBirth = value ?? null }

  get pictureUrl() { return this.props.pictureUrl }
  set pictureUrl(value: string | null) { this.props.pictureUrl = value ?? null }

  clone(): UserProfile {
    return new UserProfile({ ...this.props })
  }
}

export interface PublicUserProfile {
  firstName: string
  lastName: string | null
  dateOfBirth: string | null
  pictureUrl: string | null
}

