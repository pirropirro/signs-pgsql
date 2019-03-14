import { isString } from "util";
import { Dictionary } from "lodash";
import { injectable, inject } from "inversify";
import { SQLStatement } from "sql-template-strings";

import { IPGClient } from "../pgsql/IPGClient";

export type CRUDQueries<T> = {
    CREATE: (id: string, item: T) => SQLStatement;
    GET: (id: string) => SQLStatement;
    RETRIEVE: (options: Dictionary<any>) => SQLStatement;
    UPDATE: (id: string, item: T) => SQLStatement;
    DELETE: (id: string) => SQLStatement;
}

export interface ICRUDRepository<T> {
    create(id: string, item: T): Promise<T>;
    retrieve(id: string): Promise<T>;
    retrieve(whereValues?: Dictionary<any>): Promise<T[]>;
    update(id: string, item: T): Promise<T>;
    delete(id: string): Promise<void>;
}

export class CRUDRepository<T> implements ICRUDRepository<T>{
    constructor(private client: IPGClient, private queries: CRUDQueries<T>) { }

    public create(id: string, item: T): Promise<T> {
        return this.client.process<T>(this.queries.CREATE(id, item)).then(() => item);
    }

    public retrieve(id: string): Promise<T>;
    public retrieve(whereValues?: Dictionary<any>): Promise<T[]>;
    public retrieve(idOrValues: string | Dictionary<any> = {}): Promise<T | T[]> {
        if (isString(idOrValues)) return this.client.process<T[]>(this.queries.GET(idOrValues)).then(([row]) => row);

        return this.client.process<T>(this.queries.RETRIEVE(idOrValues));
    }

    public update(id: string, item: T): Promise<T> {
        return this.client.process<T>(this.queries.UPDATE(id, item)).then(([row]) => row);
    }

    public delete(id: string): Promise<void> {
        return this.client.process<T>(this.queries.DELETE(id)).then(() => null);
    }
}

@injectable()
export class CRUDRepositoryFactory {
    constructor(@inject("IPGClient") private client: IPGClient) { }

    create<T>(queries: CRUDQueries<T>): CRUDRepository<T> {
        return new CRUDRepository(this.client, queries);
    }
}