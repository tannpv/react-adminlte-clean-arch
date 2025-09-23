import { MysqlDatabaseService } from "../../persistence/mysql/mysql-database.service";
export declare class SchemaMigrationController {
    private readonly dbService;
    constructor(dbService: MysqlDatabaseService);
    addNormalizedColumns(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        timestamp: string;
    }>;
}
