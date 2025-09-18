export declare class PasswordService {
    private readonly saltRounds;
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
    hashSync(plain: string): string;
}
