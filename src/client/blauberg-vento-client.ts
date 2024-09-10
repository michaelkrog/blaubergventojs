/**
 * BlaubergVentoClient module.
 * 
 * This module provides a client interface for discovering and communicating with Blauberg Vento devices 
 * over the local network using UDP. The client is capable of broadcasting packets to find devices, 
 * and sending data packets to specific controllers to retrieve responses or configure the device.
 */

import { Packet } from "./packet";
import { createSocket } from 'dgram';
import { FunctionType } from "./function-type";
import { DataEntry } from "./data-entry";
import { Parameter } from "./parameter";
import { Response } from "./response";

const BROADCAST_ADDRESS = "255.255.255.255";
const DEFAULT_TIMEOUT = 1000;

/**
 * DeviceAddress interface.
 * 
 * Represents the structure of a discovered device's address information.
 * 
 * @property {string} id - The unique identifier of the device (usually extracted from the packet).
 * @property {string} ip - The IP address of the discovered device.
 */
export interface DeviceAddress {
    id: string;
    ip: string;
}

/**
 * BlaubergVentoClient class.
 * 
 * This class provides methods to discover Blauberg Vento devices on the local network and to communicate
 * with specific controllers via UDP. It broadcasts messages to detect devices and handles the reception 
 * of responses from these devices.
 */
export class BlaubergVentoClient {
    
    timeout = DEFAULT_TIMEOUT;

    /**
     * Find devices on the network by emitting a broadcast packet and collecting all answering controllers.
     * 
     * This method sends a broadcast UDP message with a search packet to discover Blauberg Vento devices. 
     * The devices respond with their identifiers and IP addresses, which are collected and returned.
     * 
     * @returns {Promise<DeviceAddress[]>} A promise that resolves to an array of DeviceAddress objects 
     * representing the discovered devices.
     */
    public async findDevices(): Promise<DeviceAddress[]> {
        const packet = new Packet('DEFAULT_DEVICEID', '', FunctionType.READ, [DataEntry.of(Parameter.SEARCH)]);
        const socket = createSocket('udp4');

        // Listen for the socket to be ready and send the broadcast packet
        socket.on('listening', function () {
            socket.setBroadcast(true);
            const data = packet.toBytes();
            socket.send(data, 4000, BROADCAST_ADDRESS);
        });

        // Create a promise that resolves once devices have been collected or the timeout has been reached
        const prom = new Promise<DeviceAddress[]>(resolve => {
            const devices: DeviceAddress[] = [];
            let lastResponseTime = new Date();

            // Check for timeouts and resolve the promise if no new responses are received
            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - lastResponseTime.getTime() > this.timeout) {
                    clearInterval(intervalHandle);
                    socket.close();
                    resolve(devices);
                }
            }, 20);

            // Handle incoming messages and collect device information
            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                
                // Only handle response packets from devices
                if(packet.functionType == FunctionType.RESPONSE) {
                    devices.push({id: packet.deviceId, ip: remote.address});
                    lastResponseTime = new Date();
                }
            });
        });

        // Bind the socket to start listening
        socket.bind();
        return prom;
    }

    /**
     * Sends a packet to a specific controller.
     * 
     * This method sends a data packet to a specific Blauberg Vento controller via its IP address.
     * It listens for a response packet and resolves with the packet or void if no response is received within the timeout period.
     * 
     * @param {Packet} packet - The packet to send to the controller.
     * @param {string} [ip=BROADCAST_ADDRESS] - The IP address of the controller (default is the broadcast address).
     * @returns {Promise<Response | void>} A promise that resolves with a response packet if received, or void if no response.
     */
    public send(packet: Packet, ip: string = BROADCAST_ADDRESS): Promise<Response | void> {
        const socket = createSocket('udp4');
        console.log('send', ip);

        // Create a promise that resolves once the packet is acknowledged or the timeout is reached
        const prom = new Promise<Response | void>(resolve => {
            let requestTime = new Date();

            // Helper function to resolve the promise and clean up resources
            const doResolve = (packet?: Packet, ip?: string) => {
                console.log('resolve: ', packet);
                clearInterval(intervalHandle);
                socket.close();
                resolve(packet != null ? {packet, ip} : null);
            }

            // Check for timeouts and resolve the promise if no response is received
            const intervalHandle = setInterval(() => {
                const now = new Date();
                if(now.getTime() - requestTime.getTime() > this.timeout) {
                    doResolve();
                }
            }, 20);

            // Send the packet once the socket is ready
            socket.on('listening', function () {
                requestTime = new Date();
                const data = packet.toBytes();
                console.log('Sending', ip, packet);
                socket.send(data, 4000, ip);
            });
            
            // Handle incoming messages and resolve if a valid response is received
            socket.on('message', function (message, remote) {
                const packet = Packet.fromBytes(message);
                
                // Only handle response packets from the controller
                if(packet.functionType == FunctionType.RESPONSE) {
                    doResolve(packet, remote.address);
                }
            });
        });

        // Bind the socket to start listening
        socket.bind();
        return prom;
    }

}
