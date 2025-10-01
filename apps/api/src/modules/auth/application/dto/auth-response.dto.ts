import { UserResponseDto } from '../../../users/application/dto/user-response.dto';

export class AuthResponseDto {
  user: UserResponseDto;
  token: string;
  expiresIn: string;

  constructor(user: UserResponseDto, token: string, expiresIn: string) {
    this.user = user;
    this.token = token;
    this.expiresIn = expiresIn;
  }
}

