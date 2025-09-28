import { RoleRepository } from "../../domain/repositories/role.repository";
import { UserRepository } from "../../domain/repositories/user.repository";
import { BaseValidatorService } from "../../shared/validation/base-validator.service";
import { ValidationResult } from "../../shared/validation/validation.types";
import { UpdateUserDto } from "../dto/update-user.dto";
export declare class UserUpdateValidationService extends BaseValidatorService<UpdateUserDto> {
    private readonly users;
    private readonly roles;
    constructor(users: UserRepository, roles: RoleRepository);
    validate(data: UpdateUserDto, userId: number): Promise<ValidationResult>;
    private validateEmailUniqueness;
    private validateRoles;
    private validatePasswordField;
    private validateFirstName;
    private validateLastName;
    private validateDateOfBirth;
    private validatePictureUrl;
}
