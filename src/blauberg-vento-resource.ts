import { CrudRepository, Page, PageRequest } from "@apaq/leap-data-core";
import { BlaubergVentoClient } from "./client/blauberg-vento-client";
import { DataEntry } from "./client/data-entry";
import { FunctionType } from "./client/function-type";
import { Packet } from "./client/packet";
import { Parameter } from "./client/parameter";
import { Response } from "./client/response";
import { Device } from "./device";

export class BlaubergVentoResource implements CrudRepository<Device, string>{

    private client = new BlaubergVentoClient();

    constructor() {
        this.client.timeout = 500;
    }

    async findAll(pageable?: PageRequest): Promise<Page<Device>> {
        pageable = pageable ?? {page: 0, size: 20};
        pageable.size = pageable.size ?? 20;
        pageable.page = pageable.page ?? 0;

        let deviceAddresses = await this.client.findDevices();
        const totalElements = deviceAddresses.length;
        const totalPages = Math.ceil(totalElements / pageable.size);
        const offset = pageable.page * pageable.size;
        const end = offset + pageable.size;
        deviceAddresses = deviceAddresses.filter((value, index) => index >= offset && index < end);

        const devices: Device[] = [];
        for(let i=0;i<deviceAddresses.length;i++) {
            const device = await this.resolveDevice(deviceAddresses[i].id, deviceAddresses[i].ip);
            devices.push(device);
        }

        return {content: devices, size: pageable.size, totalElements, totalPages};
    }

    async findById(id: string): Promise<Device> {
        return this.resolveDevice(id);
    }

    save(entity: Device): Promise<Device> {
        throw new Error("Method not implemented.");
    }

    saveAll(entities: Device[]): Promise<Device[]> {
        throw new Error("Method not implemented.");
    }

    deleteById(id: string): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    deleteAllById(ids: string[]): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    delete(entity: Device): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }

    deleteAll(entities: Device[]): Promise<void> {
        throw new Error("Devices cannot be deleted.");
    }
 
    private async resolveDevice(id: string, ip?: string): Promise<Device> {
        const packet = new Packet(id, '1111', FunctionType.READ, [
            DataEntry.of(Parameter.ON_OFF),
            DataEntry.of(Parameter.VENTILATION_MODE),
            DataEntry.of(Parameter.SPEED),
            DataEntry.of(Parameter.MANUAL_SPEED),
            DataEntry.of(Parameter.FAN1RPM),
            DataEntry.of(Parameter.FILTER_ALARM),
            DataEntry.of(Parameter.FILTER_TIMER),
            DataEntry.of(Parameter.CURRENT_HUMIDITY),
            DataEntry.of(Parameter.READ_FIRMWARE_VERSION),
            DataEntry.of(Parameter.CURRENT_IP_ADDRESS)
        ]);
        const response = await this.client.send(packet, ip) as Response;
        if(response == null) {
            return null;
        }

        return Device.fromPacket(response.packet);
    }

}