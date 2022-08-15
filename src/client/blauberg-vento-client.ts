import { Packet } from "./packet";
import { createSocket } from 'dgram';
import { FunctionType } from "./function-type";
import { DataEntry } from "./data-entry";
import { Parameter } from "./parameter";
import { Response } from "./response";

const BROADCAST_ADDRESS = "255.255.255.255";
const DEFAULT_TIMEOUT = 1000;

export interface DeviceAddress {
    id: string;
    ip: string;
}

export class BlaubergVentoClient {
    
    timeout = DEFAULT_TIMEOUT;

    /**
     * Find devices on the network by emitting a broadcast package and collecting all answering controllers.
     * @returns 
     */
    public async findDevices(): Promise<DeviceAddress[]> {
        const packet = new Packet('DEFAULT_DEVICEID', '', FunctionType.READ, [DataEntry.of(Parameter.SEARCH)]);
        const socket = createSocket('udp4');

        socket.on('listening', function () {
            socket.setBroadcast(true);
            const data = packet.toBytes();
            socket.send(data, 4000, BROADCAST_ADDRESS);
        });

        const prom = new Promise<DeviceAddress[]>(resolve => {
            const devices: DeviceAddress[] = [];
            let lastResponseTime = new Date();

            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - lastResponseTime.getTime() > this.timeout) {
                    clearInterval(intervalHandle);
                    socket.close();
                    resolve(devices);
                }
            }, 20);

            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                
                // We only handle responses to our request.
                if(packet.functionType == FunctionType.RESPONSE) {
                    devices.push({id: packet.deviceId, ip: remote.address});
                    lastResponseTime = new Date();
                }
            });
        });

        socket.bind();
        return prom;
    }

    /**
     * Sends a packet to a specific controller.
     * @param ip The ip of the controller.
     * @param packet The packet to send.
     * @returns Either a packet or nothing, depending on the packet sent to the controller.
     */

    public send(packet: Packet, ip: string = BROADCAST_ADDRESS): Promise<Response | void> {
        const socket = createSocket('udp4');
        console.log('send', ip);

        const prom = new Promise<Response | void>(resolve => {
            let requestTime = new Date();

            const doResolve = (packet?: Packet, ip?: string) => {
                console.log('resolve: ', packet);
                clearInterval(intervalHandle);
                socket.close();
                resolve(packet != null ? {packet, ip} : null);
            }

            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - requestTime.getTime() > this.timeout) {
                    doResolve();
                }
            }, 20);

            socket.on('listening', function () {
                requestTime = new Date();
                const data = packet.toBytes();
                console.log('Sending', ip, packet);
                socket.send(data, 4000, ip);
                if(packet.functionType == FunctionType.WRITE) {
                    //doResolve();
                }
            });
            
            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                
                // We only handle responses to our request.
                if(packet.functionType == FunctionType.RESPONSE) {
                    doResolve(packet, remote.address);
                }
            });
        });
        socket.bind();
        return prom;
    }

}