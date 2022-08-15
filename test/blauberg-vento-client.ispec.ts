import {BlaubergVentoClient} from '../src/client/blauberg-vento-client';
import { DataEntry } from '../src/client/data-entry';
import { FunctionType } from '../src/client/function-type';
import { Packet } from '../src/client/packet';
import { Parameter } from '../src/client/parameter';

describe("test client", () => {
  
  
  it("should find devices", async () => {
    // Arrange
    const client = new BlaubergVentoClient();
    
    // Act
    const result = await client.findDevices();

    // Assert
    expect(result.length).toBe(2);
  });

  it("should resolve firmware", async () => {
    // Arrange
    const client = new BlaubergVentoClient();
    const result = await client.findDevices();
    const device = result[0];

    // Act
    const request = new Packet(device.id, '1111', FunctionType.READ, [DataEntry.of(Parameter.READ_FIRMWARE_VERSION)]);
    const response = await client.send(device.ip, request) as Packet;

    // Assert
    console.log(response.dataEntries[0].value);
    expect(response!.dataEntries.length).toBe(1);
    expect(response!.dataEntries[0].parameter).toBe(Parameter.READ_FIRMWARE_VERSION);

    const value = response!.dataEntries[0].value!;
    const major = value[0];
    const minor = value[1];
    const day = value[2];
    const month = value[3];
    const year = value[4] + (value[5] << 8);
    expect(major).toBe(0);
    expect(minor).toBe(4);
    expect(day).toBe(20);
    expect(month).toBe(12);
    expect(year).toBe(2019);
    
  });

});
