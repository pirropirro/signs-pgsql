import Client from "pg/lib/client";
import { ILogger } from 'signs-js';
import { inject, injectable } from "inversify";

import { IPGClient } from "./IPGClient";

@injectable()
export class PGClient implements IPGClient {
    constructor(@inject("PG/Client") private client: Client,
        @inject("ILogger") private logger: ILogger) {
        this.logger.setContext("PGClient");
    }

    async process<T>(query: { text: string; values?: any[] }): Promise<T[]> {
        this.logger.debug("Execute", query.text, JSON.stringify(query.values))
        return this.client.query(query).then(data => data.rows);
    }
}