import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Carrier } from "../../modules/carrier/domain/entities/carrier.entity";
import { Customer } from "../../modules/customer/domain/entities/customer.entity";
import { Role } from "../../modules/users/domain/entities/role.entity";
import { User } from "../../modules/users/domain/entities/user.entity";

config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 7777,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "adminlte",
  entities: [User, Role, Carrier, Customer],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});
