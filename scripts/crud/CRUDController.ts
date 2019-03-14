import * as uuid from "uuid";
import { Request } from "express";
import { Dictionary } from 'lodash';
import { plainToClass } from "class-transformer";
import { injectable, unmanaged } from "inversify";
import { IController, Route, RouteType, BadRequestException } from "signs-js";

import { ICRUDRepository } from "./CRUDRepository";
import { IValidatable, Constructor } from "../Validatable";

@injectable()
export abstract class CRUDController<T extends IValidatable & Dictionary<any>> implements IController {
    protected abstract get repository(): ICRUDRepository<T>

    constructor(@unmanaged() private constr: Constructor<T>, @unmanaged() private pk: keyof T) { }

    @Route(RouteType.POST, "/")
    async create(req: Request): Promise<T> {
        let item = this.extract(req.body);
        return this.repository.create(this.pkFor(item) || uuid.v4(), item);
    }

    @Route(RouteType.GET, "/")
    async retrieve(req: Request): Promise<T[] | T> {
        return this.repository.retrieve(req.query);
    }

    @Route(RouteType.GET, "/:id")
    async retrieveItem(req: Request): Promise<T[] | T> {
        return this.repository.retrieve(req.params.id);
    }

    @Route(RouteType.POST, "/:id")
    async update(req: Request): Promise<T> {
        let { id } = req.params;
        let item = this.extract(req.body);
        return this.repository.update(id, item);
    }

    @Route(RouteType.DELETE, "/:id")
    async delete(req: Request): Promise<void> {
        return this.repository.delete(req.params.id);
    }

    private pkFor(item: T): string {
        return item[this.pk];
    }

    private extract(body: any): T {
        let item = plainToClass<T, T>(this.constr, body);
        if (item.hasErrors()) throw new BadRequestException(item.errors());

        return item;
    }
}
