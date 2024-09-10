import { Persistable } from "@apaq/leap-data-core";
import { DataEntry } from "../client/data-entry";
import { FunctionType } from "../client/function-type";
import { Packet } from "../client/packet";
import { Parameter } from "../client/parameter";
import { Mode } from "./mode";
import { Speed } from "./speed";

/**
 * A class representing a single Duke One Device.
 * 
 * This class provides methods to serialize and deserialize device state
 * from and to `Packet` instances, and to manage device-specific properties.
 */
export class Device implements Persistable<string> {

    /**
     * The current speed setting of the device.
     */
    speed?: Speed;

    /**
     * The current mode of the device.
     */
    mode?: Mode;

    /**
     * The manual speed setting of the device.
     */
    manualSpeed: number;

    /**
     * The RPM of the first fan.
     */
    fan1Rpm: number;

    /**
     * The current humidity reading.
     */
    humidity: number;

    /**
     * Indicates if there is a filter alarm.
     */
    filterAlarm = false;

    /**
     * The filter time in minutes.
     */
    filterTime: number;

    /**
     * Indicates if the device is turned on.
     */
    on = false;

    /**
     * The firmware version of the device.
     */
    firmwareVersion: string;

    /**
     * The date of the firmware release.
     */
    firmwareDate: Date;

    /**
     * The unit type of the device.
     */
    unitType: number;

    /**
     * The IP address of the device.
     */
    ipAddress: string;

    /**
     * Creates an instance of the `Device` class.
     * 
     * @param {string} id - The unique identifier for the device.
     * @param {string} password - The password for the device.
     */
    constructor(
        public id: string,
        public password: string
    ) {}

    /**
     * Converts the device state to a `Packet` for communication.
     * 
     * @returns {Packet} The packet containing the device's current state.
     */
    public toPacket(): Packet {
        const dataEntries: DataEntry[] = [
            DataEntry.of(Parameter.SPEED, this.speed),
            DataEntry.of(Parameter.VENTILATION_MODE, this.mode),
            DataEntry.of(Parameter.MANUAL_SPEED, this.manualSpeed),
            DataEntry.of(Parameter.ON_OFF, this.on ? 1 : 0)
        ];
        return new Packet(this.id, this.password, FunctionType.WRITEREAD, dataEntries);
    }

    /**
     * Creates a `Device` instance from a `Packet`.
     * 
     * @param {Packet} packet - The packet containing device data.
     * @returns {Device} The device instance with properties populated from the packet.
     */
    public static fromPacket(packet: Packet): Device {
        const device = new Device(packet.deviceId, packet.password);
        packet.dataEntries.forEach(e => {
            Device.applyParameter(device, e);
        });
        return device;
    }

    /**
     * Applies a `DataEntry` to a `Device` instance, updating its properties.
     * 
     * @param {Device} device - The device to update.
     * @param {DataEntry} dataEntry - The data entry containing the parameter and value.
     */
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
