import { Persistable } from "@apaq/leap-data-core";
import { Mode } from "./mode";
import { Speed } from "./speed";

/**
 * A class representing a single Duke One Device
 */
export class Controller implements Persistable<string> {
    
    speed?: Speed;
    mode?: Mode;
    manualSpeed: number;
    fan1Rpm: number;
    humidity: number;
    filterAlarm = false;
    filterTime: number;
    onChange: Function;
    firmwareVersion: string;
    firmwareDate: Date;
    unitType: number;

    constructor(
        public id: string,
        public password: string,
        public ipAddress: string = "<broadcast>"
    ) {}
    
    /**
     * Whether the device has been initialized.
     * The device is initialized once the get initial get firmware packet has been received.
     * This packet is send when the device is added to the client
     */
    isInitialized() {
        return this.firmwareVersion != null;
    }

    whenInitialized(): Promise<void> {
        return new Promise((resolve, reject) => {
            const handle = setInterval(() => {
                if(this.isInitialized) {
                    clearInterval(handle);
                    resolve();
                }
            }, 20);
        });
    }
}

