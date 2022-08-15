import { DataEntry } from "./data-entry";
import { FunctionType } from "./function-type";
import { Parameter } from "./parameter";

const MAX_PACKET_SIZE = 256;
const HEADER = [0xFD, 0xFD];
const PROTOCOL_TYPE = 0x02;

export class Packet {
    private _controllerId: string;
    private _password: string;
    private _functionType: FunctionType;
    private _dataEntries: DataEntry[];

    constructor(controllerId: string, password: string, functionType: FunctionType, dataEntries: DataEntry[]) {
        this._controllerId = controllerId;
        this._password = password;
        this._functionType = functionType;
        this._dataEntries = dataEntries;
    }

    get controllerId() {
        return this._controllerId;
    }

    get password() {
        return this._password;
    }

    get functionType(): FunctionType {
        return this._functionType;
    }

    get dataEntries(): DataEntry[] {
        return this._dataEntries;
    }

    public toBytes(): Uint8Array {
        let bytes = new Uint8Array(MAX_PACKET_SIZE);
        let index = 0;

        // Header
        bytes[index++] = HEADER[0];
        bytes[index++] = HEADER[1];

        // Protocol Type
        bytes[index++] = PROTOCOL_TYPE;
        
        // Credentials
        index = this.writeCredential(bytes, index, this._controllerId);
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

    public static fromBytes(bytes: Uint8Array): Packet {
        let index = 0;

        // Header
        const header = [bytes[index++], bytes[index++]];
        if(header[0] != HEADER[0] && header[1] != HEADER[1]) throw new Error('Invalid header.');

        // Protocol Type
        const protocolType  = bytes[index++];
        if(protocolType != PROTOCOL_TYPE) throw new Error('Invalid protocol type.');

        // Checksum
        const checksum = Packet.calculateChecksum(bytes.subarray(2, bytes.length - 2));
        const datachecksum = bytes[bytes.length - 2] + (bytes[bytes.length - 1] << 8)
        if(checksum != datachecksum) throw new Error('Invalid checksum.');

        // Controller id
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


    private static readCredential(bytes: Uint8Array, index: number): [string, number] {
        const credentialSize = bytes[index++];
        let credential = '';
        for (let i = 0; i < credentialSize; i++) {
            credential += String.fromCharCode(bytes[index++]);
        }
        return [credential, index];
    }

    private writeCredential(bytes: Uint8Array, index: number, value: string) {
        bytes[index++] = value.length;
        for (let i = 0; i < value.length; i++) {
            bytes[index++] = value.charCodeAt(i);
        }
        return index;
    }

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
                for(let i=0;i<size;i++) {
                    value[i] = bytes[index++];
                }
            }
            entries.push({parameter, value});
        }
        return [entries, index];
        
    }

    private static calculateChecksum(bytes: Uint8Array) {
        let checksum = 0
        for(let i=0;i<bytes.length;i++) {
            checksum += bytes[i];
        }
        return checksum & 0xFFFF;
    }

}
