import { Packet } from "./packet";

/**
 * Response interface.
 * 
 * Represents a response received from a device or controller.
 */
export interface Response {
    /**
     * The packet received in the response.
     */
    packet: Packet;

    /**
     * The IP address of the device or controller that sent the response.
     */
    ip: string;
}
