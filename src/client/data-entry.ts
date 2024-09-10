/**
 * DataEntry module.
 * 
 * This module defines the structure for data entries used in communication protocols. It includes
 * an interface to represent a data entry and a namespace with a utility function to create data entries.
 */

import { Parameter } from "./parameter";

/**
 * DataEntry interface.
 * 
 * Represents a single entry of data with an associated parameter and optional value.
 * 
 * @property {Parameter} parameter - The parameter associated with this data entry.
 * @property {Uint8Array | undefined} [value] - The value of the data entry, represented as a Uint8Array.
 */
export interface DataEntry {
    parameter: Parameter;
    value?: Uint8Array;
}

export namespace DataEntry {
    /**
     * Creates a new DataEntry instance.
     * 
     * This function constructs a DataEntry object with a specified parameter and an optional value.
     * The value is converted to a Uint8Array if provided.
     * 
     * @param {Parameter} parameter - The parameter to associate with the data entry.
     * @param {number} [value] - The value to be included in the data entry (optional). If provided, it is converted to a Uint8Array.
     * @returns {DataEntry} A new DataEntry object with the given parameter and value.
     */
    export function of(parameter: Parameter, value?: number): DataEntry {
        return {parameter, value: value != null ? Uint8Array.of(value) : undefined};
    }
}
