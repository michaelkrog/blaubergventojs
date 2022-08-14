import { Parameter } from "./parameter";

export interface DataEntry {
    parameter: Parameter;
    value?: Uint8Array;
}

export namespace DataEntry {
    export function of(parameter: Parameter, value?: number) {
        return {parameter, value: value != null ? Uint8Array.of(value) : undefined};
    }
}