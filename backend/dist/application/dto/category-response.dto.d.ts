export interface CategoryResponseDto {
    id: number;
    name: string;
    parentId: number | null;
    parentName: string | null;
}
export interface CategoryHierarchyOptionDto {
    id: number;
    label: string;
    disabled: boolean;
}
export interface CategoryTreeNodeDto {
    id: number;
    name: string;
    parentId: number | null;
    depth: number;
    disabled: boolean;
    children: CategoryTreeNodeDto[];
}
export interface CategoryTreeResponseDto {
    categories: CategoryResponseDto[];
    tree: CategoryTreeNodeDto[];
    hierarchy: CategoryHierarchyOptionDto[];
}
