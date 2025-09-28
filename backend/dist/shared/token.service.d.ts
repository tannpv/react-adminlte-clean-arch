export interface TokenPayload {
    sub: number;
    iat?: number;
    exp?: number;
}
export declare class TokenService {
    private readonly secret;
    private readonly expiresIn;
    sign(userId: number): string;
    verify(token: string): TokenPayload;
}
