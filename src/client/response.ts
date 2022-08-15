import { Packet } from "./packet";

export interface Response {
    packet: Packet;
    ip: string;
}