/**
 * Enum representing the speed options available for a device.
 */
export enum Speed {
    /**
     * The device is turned off.
     */
    OFF = 0,

    /**
     * The device is set to low speed.
     */
    LOW = 1,

    /**
     * The device is set to medium speed.
     */
    MEDIUM = 2,

    /**
     * The device is set to high speed.
     */
    HIGH = 3,

    /**
     * The device is set to manual speed.
     * This value indicates that the speed is controlled manually.
     */
    MANUAL = 255
}
