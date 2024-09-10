import { Persistable } from "@apaq/leap-data-core";
import { DataEntry } from "../client/data-entry";
import { FunctionType } from "../client/function-type";
import { Packet } from "../client/packet";
import { Parameter } from "../client/parameter";
import { Mode } from "./mode";
import { Speed } from "./speed";

/**
 * A class representing a single Duke One Device
 */
export class Device implements Persistable<string> {
    
    speed?: Speed;
    mode?: Mode;
    manualSpeed: number;
    fan1Rpm: number;
    humidity: number;
    filterAlarm = false;
    filterTime: number;
    on = false;
    firmwareVersion: string;
    firmwareDate: Date;
    unitType: number;
    ipAddress: string;

    constructor(
        public id: string,
        public password: string
    ) {}

    /**
     * @deprecated
     * Use static method instead. (Device.toPacket())
     * @returns The packet for low level com.
     */
    public toPacket(): Packet {
        return Device.toPacket(this);
    }

    public static toPacket(device: Device): Packet {
        const dataEntries: DataEntry[] = [
            DataEntry.of(Parameter.SPEED, device.speed),
            DataEntry.of(Parameter.VENTILATION_MODE, device.mode),
            DataEntry.of(Parameter.MANUAL_SPEED, device.manualSpeed),
            DataEntry.of(Parameter.ON_OFF, device.on ? 1 : 0)
        ];
        return new Packet(device.id, device.password, FunctionType.WRITEREAD, dataEntries);
    }

    public static fromPacket(packet: Packet): Device {
        const device = new Device(packet.deviceId, packet.password);
        packet.dataEntries.forEach(e => {
            Device.applyParameter(device, e);
        })
        return device;
    }

    private static applyParameter(device: Device, dataEntry: DataEntry) {
        switch(dataEntry.parameter) {
            case Parameter.CURRENT_HUMIDITY:
                device.humidity = dataEntry.value[0];
                break;
            case Parameter.VENTILATION_MODE:
                device.mode = dataEntry.value[0];
                break;
            case Parameter.FAN1RPM:
                device.fan1Rpm = dataEntry.value[0] + (dataEntry.value[1] << 8);
                break;
            case Parameter.FILTER_ALARM:
                device.filterAlarm = dataEntry.value[0] === 1;
                break;
            case Parameter.FILTER_TIMER:
                device.filterTime = dataEntry.value[0] + (dataEntry.value[2] * 24 + dataEntry.value[1]) * 60;
                break;
            case Parameter.CURRENT_IP_ADDRESS:
                device.ipAddress = `${dataEntry.value[0]}.${dataEntry.value[1]}.${dataEntry.value[2]}.${dataEntry.value[3]}`;
                break;
            case Parameter.MANUAL_SPEED:
                device.manualSpeed = dataEntry.value[0];
                break;
            case Parameter.SPEED:
                device.speed = dataEntry.value[0];
                break;
            case Parameter.ON_OFF:
                device.on = dataEntry.value[0] == 1;
                break;
            case Parameter.READ_FIRMWARE_VERSION:
                const major = dataEntry.value[0];
                const minor = dataEntry.value[1];
                const day = dataEntry.value[2];
                const month = dataEntry.value[3];
                const year = dataEntry.value[4] + (dataEntry.value[5] << 8);
                device.firmwareVersion = `${major}.${minor}`;
                device.firmwareDate = new Date(`${year}-${month}-${day}`);
                break;
            case Parameter.UNIT_TYPE:
                device.unitType = dataEntry.value[0];
                break;

        }
    }
}

