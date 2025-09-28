import { UserProfile, PublicUserProfile } from './user-profile.entity';
export interface PublicUser {
    id: number;
    email: string;
    roles: number[];
    profile: PublicUserProfile | null;
}
export declare class User {
    readonly id: number;
    email: string;
    roles: number[];
    passwordHash: string;
    private _profile;
    constructor(id: number, email: string, roles: number[], passwordHash: string, _profile?: UserProfile | null);
    get profile(): UserProfile | null;
    set profile(profile: UserProfile | null);
    toPublic(): PublicUser;
    clone(): User;
}
