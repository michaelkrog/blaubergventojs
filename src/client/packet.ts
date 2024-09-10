/**
 * Packet class.
 * 
 * Represents a communication packet used in the protocol. The packet includes headers, credentials, 
 * function types, data entries, and a checksum to ensure data integrity. It provides methods to 
 * serialize the packet to bytes and to deserialize it from bytes.
 */

import { DataEntry } from "./data-entry";
import { FunctionType } from "./function-type";
import { Parameter } from "./parameter";

const MAX_PACKET_SIZE = 256;
const HEADER = [0xFD, 0xFD];
const PROTOCOL_TYPE = 0x02;

/**
 * Packet class.
 * 
 * This class is used to create, serialize, and deserialize packets for communication. It includes 
 * functionality to handle different types of functions and data entries, as well as to validate 
 * the integrity of the packet using a checksum.
 */
export class Packet {
    private _deviceId: string;
    private _password: string;
    private _functionType: FunctionType;
    private _dataEntries: DataEntry[];

    /**
     * Creates a new Packet instance.
     * 
     * @param {string} deviceId - The device ID to include in the packet.
     * @param {string} password - The password for the device.
     * @param {FunctionType} functionType - The type of function to perform.
     * @param {DataEntry[]} dataEntries - The data entries to include in the packet.
     */
    constructor(deviceId: string, password: string, functionType: FunctionType, dataEntries: DataEntry[]) {
        this._deviceId = deviceId;
        this._password = password;
        this._functionType = functionType;
        this._dataEntries = dataEntries;
    }

    /**
     * Gets the device ID.
     * 
     * @returns {string} The device ID.
     */
    get deviceId() {
        return this._deviceId;
    }

    /**
     * Gets the password.
     * 
     * @returns {string} The password.
     */
    get password() {
        return this._password;
    }

    /**
     * Gets the function type.
     * 
     * @returns {FunctionType} The function type.
     */
    get functionType(): FunctionType {
        return this._functionType;
    }

    /**
     * Gets the data entries.
     * 
     * @returns {DataEntry[]} The data entries.
     */
    get dataEntries(): DataEntry[] {
        return this._dataEntries;
    }

    /**
     * Serializes the packet to a byte array.
     * 
     * The packet is serialized into a Uint8Array with a specific format including a header, protocol type,
     * credentials, function type, data entries, and a checksum.
     * 
     * @returns {Uint8Array} The serialized byte array of the packet.
     */
    public toBytes(): Uint8Array {
        let bytes = new Uint8Array(MAX_PACKET_SIZE);
        let index = 0;

        // Header
        bytes[index++] = HEADER[0];
        bytes[index++] = HEADER[1];

        // Protocol Type
        bytes[index++] = PROTOCOL_TYPE;
        
        // Credentials
        index = this.writeCredential(bytes, index, this._deviceId);
        index = this.writeCredential(bytes, index, this._password);

        // Function
        bytes[index++] = this._functionType;

        // Data
        this._dataEntries.forEach(e => {
            bytes[index++] = e.parameter;
            if(e.value != null && 
                (this.functionType == FunctionType.WRITE || this.functionType == FunctionType.WRITEREAD)) {
                const size = Parameter.getSize(e.parameter);
                for(let i=0;i<size;i++) {
                    bytes[index++] = e.value[i];
                }
            }
        })

        // CRC
        const checksum = Packet.calculateChecksum(bytes.subarray(2, index));
        bytes[index++] = checksum & 0xFF;
        bytes[index++] = checksum >> 8;

        // Trim
        bytes = bytes.subarray(0, index);

        return bytes;
    }

    /**
     * Deserializes a byte array into a Packet instance.
     * 
     * @param {Uint8Array} bytes - The byte array to deserialize.
     * @returns {Packet} The deserialized Packet instance.
     * @throws {Error} If the header, protocol type, or checksum are invalid.
     */
    public static fromBytes(bytes: Uint8Array): Packet {
        let index = 0;

        // Header
        const header = [bytes[index++], bytes[index++]];
        if(header[0] != HEADER[0] || header[1] != HEADER[1]) throw new Error('Invalid header.');

        // Protocol Type
        const protocolType  = bytes[index++];
        if(protocolType != PROTOCOL_TYPE) throw new Error('Invalid protocol type.');

        // Checksum
        const checksum = Packet.calculateChecksum(bytes.subarray(2, bytes.length - 2));
        const datachecksum = bytes[bytes.length - 2] + (bytes[bytes.length - 1] << 8);
        if(checksum != datachecksum) throw new Error('Invalid checksum.');

        // Controller ID
        const idResult = Packet.readCredential(bytes, index);
        const controllerId = idResult[0];
        index = idResult[1];

        // Password
        const passwordResult = Packet.readCredential(bytes, index);
        const password = passwordResult[0];
        index = passwordResult[1];

        // Function
        const functionType = bytes[index++];

        // Data
        const dataResult = Packet.readParameters(bytes, index);

        return new Packet(controllerId, password, functionType, dataResult[0]);
    }

    /**
     * Reads a credential from the byte array.
     * 
     * @param {Uint8Array} bytes - The byte array containing the credential.
     * @param {number} index - The starting index to read from.
     * @returns {[string, number]} A tuple containing the credential string and the next index.
     */
    private static readCredential(bytes: Uint8Array, index: number): [string, number] {
        const credentialSize = bytes[index++];
        let credential = '';
        for (let i = 0; i < credentialSize; i++) {
            credential += String.fromCharCode(bytes[index++]);
        }
        return [credential, index];
    }

    /**
     * Writes a credential to the byte array.
     * 
     * @param {Uint8Array} bytes - The byte array to write to.
     * @param {number} index - The starting index to write at.
     * @param {string} value - The credential to write.
     * @returns {number} The next index after writing the credential.
     */
    private writeCredential(bytes: Uint8Array, index: number, value: string): number {
        bytes[index++] = value.length;
        for (let i = 0; i < value.length; i++) {
            bytes[index++] = value.charCodeAt(i);
        }
        return index;
    }

    /**
     * Reads data entries (parameters and values) from the byte array.
     * 
     * @param {Uint8Array} bytes - The byte array containing the data entries.
     * @param {number} index - The starting index to read from.
     * @returns {[DataEntry[], number]} A tuple containing the array of DataEntry objects and the next index.
     */
    private static readParameters(bytes: Uint8Array, index: number): [DataEntry[], number] {
        const entries: DataEntry[] = [];
        while(index < bytes.length - 3) {
            let parameter = bytes[index++];
            let value: Uint8Array;
            let size = 1;
            if(parameter == 0xFE) {
                // Change parameter size
                size = bytes[index++];
                parameter = bytes[index++];
            } else {
                size = Parameter.getSize(parameter);
                if(size < 0) throw new Error(`Invalid parameter [param=${parameter}]`);
            }

            if(size > 0) {
                value = new Uint8Array(size);
                for(let i = 0; i < size; i++) {
                    value[i] = bytes[index++];
                }
            }
            entries.push({parameter, value});
        }
        return [entries, index];
    }

    /**
     * Calculates the checksum for a byte array.
     * 
     * @param {Uint8Array} bytes - The byte array to calculate the checksum for.
     * @returns {number} The calculated checksum.
     */
    private static calculateChecksum(bytes: Uint8Array): number {
        let checksum = 0;
        for(let i = 0; i < bytes.length; i++) {
            checksum += bytes[i];
        }
        return checksum & 0xFFFF;
    }
}
