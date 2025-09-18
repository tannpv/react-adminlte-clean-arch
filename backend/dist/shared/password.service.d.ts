import { PasswordConfig } from './config';
export declare class PasswordService {
    private readonly options;
    constructor(options: PasswordConfig);
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
    hashSync(plain: string): string;
}
