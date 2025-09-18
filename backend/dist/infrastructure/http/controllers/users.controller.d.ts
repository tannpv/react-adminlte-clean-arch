import { UsersService } from '../../../application/services/users.service';
import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../../application/dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(): Promise<import("../../../application/dto/user-response.dto").UserResponseDto[]>;
    getOne(id: number): Promise<import("../../../application/dto/user-response.dto").UserResponseDto>;
    create(dto: CreateUserDto): Promise<import("../../../application/dto/user-response.dto").UserResponseDto>;
    update(id: number, dto: UpdateUserDto): Promise<import("../../../application/dto/user-response.dto").UserResponseDto>;
    remove(id: number): Promise<import("../../../application/dto/user-response.dto").UserResponseDto>;
}
