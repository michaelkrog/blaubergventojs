/**
 * Enum representing the directions available for a device.
 * 
 * The direction can be configured by the device's dip switch.
 */
export enum Mode {
    /**
     * One-way direction.
     * The direction is set based on the dip switch on the device.
     */
    ONEWAY = 0,

    /**
     * Two-way direction.
     */
    TWOWAY = 1,

    /**
     * Inward direction.
     */
    IN = 2
}
