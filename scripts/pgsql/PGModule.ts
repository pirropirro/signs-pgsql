import { Client } from "pg";
import { IModule } from "signs-js";
import { interfaces } from "inversify";

import { PGClient } from "./PGClient";
import { IPGClient } from "./IPGClient";
import { IPGConfig } from "./IPGConfig";
import { CRUDRepositoryFactory } from "../crud/CRUDRepository";

export class PGModule implements IModule {
    modules(container: interfaces.Container): void {
        container.bind<Client>("PG/Client").toDynamicValue(() => {
            let client = new Client(container.get<IPGConfig>("IPGConfig"));
            client.connect();
            return client;
        }).inSingletonScope();

        container.bind<IPGClient>("IPGClient").to(PGClient).inSingletonScope();
        container.bind<CRUDRepositoryFactory>("CRUDRepositoryFactory").to(CRUDRepositoryFactory).inSingletonScope();
    }
}
