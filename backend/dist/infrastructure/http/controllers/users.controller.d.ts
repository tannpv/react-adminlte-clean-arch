import { UsersService } from '../../../application/services/users.service';
import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../../application/dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(): Promise<import("../../../domain/entities/user.entity").PublicUser[]>;
    getOne(id: number): Promise<import("../../../domain/entities/user.entity").PublicUser>;
    create(dto: CreateUserDto): Promise<import("../../../domain/entities/user.entity").PublicUser>;
    update(id: number, dto: UpdateUserDto): Promise<import("../../../domain/entities/user.entity").PublicUser>;
    remove(id: number): Promise<import("../../../domain/entities/user.entity").PublicUser>;
}
