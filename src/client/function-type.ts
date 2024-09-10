/**
 * FunctionType enumeration.
 * 
 * This enum defines the different types of functions that can be used in communication protocols.
 * Each type is represented by a unique byte value.
 */
export enum FunctionType {
    /**
     * READ function type.
     * 
     * Indicates a request to read data from a device or controller.
     */
    READ = 0x01,

    /**
     * WRITE function type.
     * 
     * Indicates a request to write data to a device or controller.
     */
    WRITE = 0x02,

    /**
     * WRITEREAD function type.
     * 
     * Indicates a request to both write data to and read data from a device or controller.
     */
    WRITEREAD = 0x03,

    /**
     * INCREAD function type.
     * 
     * Indicates a request to increment a value on a device or controller and read the result.
     */
    INCREAD = 0x04,

    /**
     * DECREAD function type.
     * 
     * Indicates a request to decrement a value on a device or controller and read the result.
     */
    DECREAD = 0x05,

    /**
     * RESPONSE function type.
     * 
     * Indicates a response from a device or controller to a request.
     */
    RESPONSE = 0x06
}
