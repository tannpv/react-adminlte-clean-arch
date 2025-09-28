export declare class Category {
    readonly id: number;
    name: string;
    parentId: number | null;
    constructor(id: number, name: string, parentId?: number | null);
    clone(): Category;
}
