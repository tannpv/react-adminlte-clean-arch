export interface UserProfileProps {
    userId: number;
    firstName: string;
    lastName: string | null;
    dateOfBirth: Date | null;
    pictureUrl: string | null;
}
export declare class UserProfile {
    private props;
    constructor(props: UserProfileProps);
    get userId(): number;
    get firstName(): string;
    set firstName(value: string);
    get lastName(): string | null;
    set lastName(value: string | null);
    get dateOfBirth(): Date | null;
    set dateOfBirth(value: Date | null);
    get pictureUrl(): string | null;
    set pictureUrl(value: string | null);
    clone(): UserProfile;
}
export interface PublicUserProfile {
    firstName: string;
    lastName: string | null;
    dateOfBirth: string | null;
    pictureUrl: string | null;
}
