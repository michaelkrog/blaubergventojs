import { Packet } from "./packet";
import { Socket } from 'net';
import { createSocket } from 'dgram';
import { FunctionType } from "./function-type";
import { DataEntry } from "./data-entry";
import { Parameter } from "./parameter";
import * as loglevel from 'loglevel';

const BROADCAST_ADDRESS = "255.255.255.255";
const TIMEOUT = 1000;
const logger = loglevel.getLogger('BlaubergVentoClient');

export interface DeviceAddress {
    id: string;
    ip: string;
}

export class BlaubergVentoClient {

    /**
     * Find devices on the network by emitting a broadcast package and collecting all answering controllers.
     * @returns 
     */
    public async findDevices(): Promise<DeviceAddress[]> {
        const packet = new Packet('DEFAULT_DEVICEID', '', FunctionType.READ, [DataEntry.of(Parameter.SEARCH)]);
        const socket = createSocket('udp4');

        socket.on('listening', function () {
            logger.debug('Socket started listening. Sending broadcast packet.');
            socket.setBroadcast(true);
            const data = packet.toBytes();
            socket.send(data, 4000, '255.255.255.255');
        });

        const prom = new Promise<DeviceAddress[]>(resolve => {
            const devices: DeviceAddress[] = [];
            let lastResponseTime = new Date();

            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - lastResponseTime.getTime() > TIMEOUT) {
                    logger.debug('Timeout for responses. Devices found: ', devices);
                    clearInterval(intervalHandle);
                    socket.close();
                    resolve(devices);
                }
            }, 20);

            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                logger.debug('Packet received.', packet);

                // We only handle responses to our request.
                if(packet.functionType == FunctionType.RESPONSE) {
                    logger.debug('Packet is a response from device.', packet);
                    devices.push({id: packet.controllerId, ip: remote.address});
                    lastResponseTime = new Date();
                }
            });
        });

        socket.bind({exclusive: false, port: 4000, address: '0.0.0.0'});
        return prom;
    }

    /**
     * Sends a packet to a specific controller.
     * @param ip The ip of the controller.
     * @param packet The packet to send.
     * @returns Either a packet or nothing, depending on the packet sent to the controller.
     */

    public send(ip: string, packet: Packet): Promise<Packet | void> {
        const socket = createSocket('udp4');

        const prom = new Promise<Packet>(resolve => {
            let requestTime = new Date();

            const doResolve = (value) => {
                clearInterval(intervalHandle);
                socket.close();
                resolve(value);
            }

            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - requestTime.getTime() > TIMEOUT) {
                    logger.debug('Timeout for response.');
                    doResolve(null);
                }
            }, 20);

            socket.on('listening', function () {
                logger.debug('Socket started listening. Sending packet.');
                const data = packet.toBytes();
                socket.send(data, 4000, ip);
                if(packet.functionType == FunctionType.WRITE) {
                    doResolve(null);
                }
            });
            
            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                logger.debug('Packet received.', packet);

                // We only handle responses to our request.
                if(packet.functionType == FunctionType.RESPONSE) {
                    logger.debug('Packet is a response from device.', packet);
                    doResolve(packet);
                }
            });
        });
        socket.bind({exclusive: false, port: 4000, address: '0.0.0.0'});
        return prom;
    }

}