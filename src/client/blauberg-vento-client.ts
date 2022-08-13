import { Packet } from "./packet";

export class BlaubergVentoClient {
    
    /**
     * Find devices on the network by emitting a broadcast package and collecting all answering controllers.
     * @returns 
     */
    public findDevices(): Promise<{id: string, ip: string}[]> {
        return null;
    }

    /**
     * Sends a packet to a specific controller.
     * @param ip The ip of the controller.
     * @param packet The packet to send.
     * @returns Either a packet or nothing, depending on the packet sent to the controller.
     */

    public send(ip: string, packet: Packet): Promise<Packet | void> {
        return null;
    }

}