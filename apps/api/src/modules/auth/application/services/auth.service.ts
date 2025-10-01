import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserResponseDto } from "../../../users/application/dto/user-response.dto";
import { UserService } from "../../../users/application/services/user.service";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(
    email: string,
    password: string
  ): Promise<UserResponseDto | null> {
    try {
      // We need to get the raw user entity to access the password field
      const userEntity = await this.userService.findByEmailRaw(email);

      if (!userEntity) {
        return null;
      }

      const isPasswordValid = await this.comparePassword(
        password,
        userEntity.password || ""
      );

      if (!isPasswordValid) {
        return null;
      }

      // Return the normalized user response
      return await this.userService.findByEmail(email);
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>("jwt.expiresIn", "24h");

    return new AuthResponseDto(user, token, expiresIn);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    try {
      await this.userService.findByEmail(registerDto.email);
      throw new ConflictException("User with this email already exists");
    } catch (error) {
      // User doesn't exist, continue with registration
      if (error instanceof ConflictException) {
        throw error;
      }
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user
    const createUserDto = {
      ...registerDto,
      password: hashedPassword,
    };

    const user = await this.userService.create(createUserDto);

    // Generate token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>("jwt.expiresIn", "24h");

    return new AuthResponseDto(user, token, expiresIn);
  }

  async refreshToken(userId: number): Promise<AuthResponseDto> {
    const user = await this.userService.findOne(userId);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>("jwt.expiresIn", "24h");

    return new AuthResponseDto(user, token, expiresIn);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
