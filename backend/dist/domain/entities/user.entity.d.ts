export interface PublicUser {
    id: number;
    name: string;
    email: string;
    roles: number[];
}
export declare class User {
    readonly id: number;
    name: string;
    email: string;
    roles: number[];
    passwordHash: string;
    constructor(id: number, name: string, email: string, roles: number[], passwordHash: string);
    toPublic(): PublicUser;
    clone(): User;
}
