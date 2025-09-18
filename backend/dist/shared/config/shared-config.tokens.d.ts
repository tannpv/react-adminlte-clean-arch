export interface JwtConfig {
    secret: string;
    expiresIn: string | number;
}
export interface PasswordConfig {
    saltRounds: number;
}
export declare const JWT_CONFIG: unique symbol;
export declare const PASSWORD_CONFIG: unique symbol;
