import SQLTempl, { SQLStatement as SQLStat } from "sql-template-strings";

export { CRUDController } from "./crud/CRUDController";
export { CRUDQueries, ICRUDRepository, CRUDRepository, CRUDRepositoryFactory } from "./crud/CRUDRepository";

export { PGModule } from "./pgsql/PGModule";
export { PGClient } from "./pgsql/PGClient";
export { IPGConfig } from "./pgsql/IPGConfig";
export { IPGClient } from "./pgsql/IPGClient";

export const SQL = SQLTempl;
export const SQLStatement = SQLStat;
