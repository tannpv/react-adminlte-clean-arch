import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserProfile } from "../../domain/entities/user-profile.entity";
import { PublicUser, User } from "../../domain/entities/user.entity";
import {
  ROLE_REPOSITORY,
  RoleRepository,
} from "../../domain/repositories/role.repository";
import {
  USER_REPOSITORY,
  UserRepository,
} from "../../domain/repositories/user.repository";
import { DEFAULT_USER_PASSWORD } from "../../shared/constants";
import { PasswordService } from "../../shared/password.service";
import { validationException } from "../../shared/validation-error";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserUpdateValidationService } from "../validation/user-update-validation.service";
import { UserValidationService } from "../validation/user-validation.service";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roles: RoleRepository,
    private readonly passwordService: PasswordService,
    private readonly userValidationService: UserValidationService,
    private readonly userUpdateValidationService: UserUpdateValidationService
  ) {}

  async list({ search }: { search?: string } = {}): Promise<PublicUser[]> {
    const users = await this.users.findAll({ search });
    return users.map((user) => user.toPublic());
  }

  async findById(id: number): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException({ message: "Not found" });
    return user.toPublic();
  }

  async findDomainById(id: number): Promise<User | null> {
    return this.users.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    // Validate input using validation service
    const validation = await this.userValidationService.validate(dto);
    if (!validation.isValid) {
      throw validationException(validation.errors);
    }

    // Business logic - create user
    const trimmedEmail = dto.email.trim().toLowerCase();
    const roleIds = dto.roles || [];
    const id = await this.users.nextId();
    const passwordHash = this.passwordService.hashSync(DEFAULT_USER_PASSWORD);

    let dateOfBirth: Date | null = null;
    if (dto.dateOfBirth) {
      dateOfBirth = new Date(dto.dateOfBirth);
    }

    const user = new User(id, trimmedEmail, roleIds, passwordHash);
    user.profile = new UserProfile({
      userId: id,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      dateOfBirth,
      pictureUrl: dto.pictureUrl?.trim() || null,
    });

    const created = await this.users.create(user);
    return created.toPublic();
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException({ message: "Not found" });

    // Validate input using validation service
    const validation = await this.userUpdateValidationService.validate(dto, id);
    if (!validation.isValid) {
      throw validationException(validation.errors);
    }

    // Business logic - update user
    const updated = existing.clone();
    const profile =
      updated.profile ??
      new UserProfile({
        userId: updated.id,
        firstName: "",
        lastName: null,
        dateOfBirth: null,
        pictureUrl: null,
      });

    if (dto.email !== undefined) {
      updated.email = dto.email.trim();
    }

    if (dto.roles !== undefined) {
      updated.roles = dto.roles;
    }

    if (dto.password !== undefined) {
      updated.passwordHash = this.passwordService.hashSync(dto.password);
    }

    if (dto.firstName !== undefined) {
      profile.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined) {
      profile.lastName = dto.lastName.trim();
    }

    if (dto.dateOfBirth !== undefined) {
      profile.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    if (dto.pictureUrl !== undefined) {
      const trimmed = dto.pictureUrl?.trim() || "";
      profile.pictureUrl = trimmed.length ? trimmed : null;
    }

    updated.profile = profile;

    const saved = await this.users.update(updated);
    return saved.toPublic();
  }

  async remove(id: number): Promise<PublicUser> {
    const removed = await this.users.remove(id);
    if (!removed) throw new NotFoundException({ message: "Not found" });
    return removed.toPublic();
  }
}
