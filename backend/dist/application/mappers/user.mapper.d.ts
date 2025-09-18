import { PublicUser, User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
export declare function toUserResponse(user: User | PublicUser): UserResponseDto;
