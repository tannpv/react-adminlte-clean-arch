import { RoleRepository } from "../../domain/repositories/role.repository";
import { UserRepository } from "../../domain/repositories/user.repository";
import { BaseValidatorService } from "../../shared/validation/base-validator.service";
import { ValidationResult } from "../../shared/validation/validation.types";
import { CreateUserDto } from "../dto/create-user.dto";
export declare class UserValidationService extends BaseValidatorService<CreateUserDto> {
    private readonly users;
    private readonly roles;
    constructor(users: UserRepository, roles: RoleRepository);
    validate(data: CreateUserDto): Promise<ValidationResult>;
    private validateFirstName;
    private validateLastName;
    private validateEmailUniqueness;
    private validateRoles;
    private validateDateOfBirth;
    private validatePictureUrl;
}
