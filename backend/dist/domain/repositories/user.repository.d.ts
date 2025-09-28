import { User } from '../entities/user.entity';
export interface UserRepository {
    findAll(params?: {
        search?: string;
    }): Promise<User[]>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    remove(id: number): Promise<User | null>;
    nextId(): Promise<number>;
}
export declare const USER_REPOSITORY = "USER_REPOSITORY";
