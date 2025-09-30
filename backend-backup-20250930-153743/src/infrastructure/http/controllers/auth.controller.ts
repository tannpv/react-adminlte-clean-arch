import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../../../application/services/auth.service'
import { RegisterDto } from '../../../application/dto/register.dto'
import { LoginDto } from '../../../application/dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
