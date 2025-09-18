import { JwtConfig } from './config';
export interface TokenPayload {
    sub: number;
    iat?: number;
    exp?: number;
}
export declare class TokenService {
    private readonly options;
    constructor(options: JwtConfig);
    sign(userId: number): string;
    verify(token: string): TokenPayload;
}
