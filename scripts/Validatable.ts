import { classToPlain } from "class-transformer";
import { validateSync, ValidatorOptions } from "class-validator";
import { Dictionary, forIn, map, reduce, first, cloneDeep, isString, union } from "lodash";

export type Constructor<T> = new (...args: any[]) => T;

export interface IValidatable {
    __validatorOptions: ValidatorOptions;
    __errors: Dictionary<string[]>;
    __defaultGroup: string;

    validate(groups?: string | string[]): void;
    errors(groups?: string | string[]): string[];
    hasErrors(groups?: string | string[]): boolean;
    errorFor(name: keyof this, groups?: string | string[]): string;
    errorsFor(name: keyof this, groups?: string | string[]): string[];
    hasErrorsFor(name: keyof this, groups?: string | string[]): boolean;
}

export const Validatable = <T extends Constructor<any>>(Base: T): Constructor<IValidatable> & T => {
    return class extends Base implements IValidatable {
        public __validatorOptions: ValidatorOptions = { skipMissingProperties: false };
        public __errors: { [key in keyof this]?: string[] } = {};
        public __defaultGroup = "all";

        public validate(groups?: string | string[]) {
            forIn(this, (v, k) => {
                if (typeof (v) !== "function") this.__errors[k] = [];
            });

            validateSync(this, this.getValidatorOptions(groups))
                .forEach(({ property, constraints }) => this.__errors[property] = map(constraints, v => v))
        }

        public hasErrors(groups?: string | string[]): boolean {
            this.validate(groups);
            return reduce<Dictionary<string[]>, number>(this.__errors, (s, errors) => s += errors.length, 0) > 0;
        }

        public errorsFor(name: keyof this, groups?: string | string[]): string[] {
            this.validate(groups);
            return this.__errors[name] || [];
        }

        public errorFor(name: keyof this, groups?: string | string[]): string {
            return first(this.errorsFor(name, groups));
        }

        public errors(groups?: string | string[]): string[] {
            this.validate(groups);
            return reduce(this.__errors, (errors, current) => [...errors, ...current]);
        }

        public hasErrorsFor(name: keyof this, groups?: string | string[]): boolean {
            return this.errorsFor(name, groups).length > 0;
        }

        private getValidatorOptions(groups: string | string[]): ValidatorOptions {
            if (!groups) {
                groups = this.__defaultGroup;
            }

            let vo: ValidatorOptions = cloneDeep(this.__validatorOptions);
            if (isString(groups)) {
                groups = [groups];
            }
            vo.groups = union(vo.groups, groups);

            return vo;
        }
    };
};

export function ToPlain<T extends Object>(obj: T): T;
export function ToPlain<T extends Object>(obj: T[]): T[];
export function ToPlain<T extends Object>(obj: T | T[]): T | T[] {
    return classToPlain(obj, { excludePrefixes: ["__validatorOptions", "__errors", "__defaultGroup"] }) as T | T[];
}

export function ToPlainCommand<T extends IValidatable>(command: T): T {
    let plainCommand: T = cloneDeep<T>(command);
    delete (plainCommand.__validatorOptions);
    delete (plainCommand.__errors);
    delete (plainCommand.__defaultGroup);
    return plainCommand;
}

export class Class { }
