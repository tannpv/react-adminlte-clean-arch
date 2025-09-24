export declare enum ProductSortBy {
    NAME = "name",
    PRICE = "price",
    CREATED_AT = "createdAt",
    UPDATED_AT = "updatedAt"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class ProductSearchDto {
    search?: string;
    categoryIds?: number[];
    attributeIds?: number[];
    attributeValueIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    statuses?: string[];
    types?: string[];
    sortBy?: ProductSortBy;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
export declare class ProductSearchResponseDto {
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    facets: {
        categories: Array<{
            id: number;
            name: string;
            count: number;
        }>;
        attributes: Array<{
            id: number;
            name: string;
            values: Array<{
                id: number;
                value: string;
                count: number;
            }>;
        }>;
        priceRange: {
            min: number;
            max: number;
        };
        statuses: Array<{
            status: string;
            count: number;
        }>;
        types: Array<{
            type: string;
            count: number;
        }>;
    };
}
