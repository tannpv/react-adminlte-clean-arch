export interface UserResponseDto {
  id: number
  email: string
  roles: number[]
  profile: {
    firstName: string
    lastName: string | null
    dateOfBirth: string | null
    pictureUrl: string | null
  } | null
}
