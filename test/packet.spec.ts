import { DataEntry } from '../src/client/data-entry';
import { FunctionType } from '../src/client/function-type';
import { Packet } from '../src/client/packet';
import { Parameter } from '../src/client/parameter';

describe("test packet", () => {
  
  
  it("should generate search package", async () => {
    // Arrange
    const packet = new Packet('DEFAULT_DEVICEID', '', FunctionType.READ, [{parameter: Parameter.SEARCH}]);

    // Act
    const data = packet.toBytes();

    // Assert
    expect(data[0]).toBe(0xFD);
    expect(data[1]).toBe(0xFD);
    expect(data[2]).toBe(0x02);
    expect(data[3]).toBe(0x10);
    expect(data[4]).toBe('D'.charCodeAt(0));
    expect(data[5]).toBe('E'.charCodeAt(0));
    expect(data[6]).toBe('F'.charCodeAt(0));
    expect(data[7]).toBe('A'.charCodeAt(0));
    expect(data[8]).toBe('U'.charCodeAt(0));
    expect(data[9]).toBe('L'.charCodeAt(0));
    expect(data[10]).toBe('T'.charCodeAt(0));
    expect(data[11]).toBe('_'.charCodeAt(0));
    expect(data[12]).toBe('D'.charCodeAt(0));
    expect(data[13]).toBe('E'.charCodeAt(0));
    expect(data[14]).toBe('V'.charCodeAt(0));
    expect(data[15]).toBe('I'.charCodeAt(0));
    expect(data[16]).toBe('C'.charCodeAt(0));
    expect(data[17]).toBe('E'.charCodeAt(0));
    expect(data[18]).toBe('I'.charCodeAt(0));
    expect(data[19]).toBe('D'.charCodeAt(0));
    expect(data[20]).toBe(0);
    expect(data[21]).toBe(FunctionType.READ);
    expect(data[22]).toBe(Parameter.SEARCH);
    expect(data[23]).toBe('0'.charCodeAt(0));
    expect(data[24]).toBe(0x05);
  });

  it("should generate firmware update request", async () => {
    // Arrange
    const packet = new Packet('003E00285742570F', '1111', FunctionType.READ, [DataEntry.of(Parameter.READ_FIRMWARE_VERSION), DataEntry.of(Parameter.UNIT_TYPE)]);

    // Act
    const data = packet.toBytes();

    // Assert
    expect(data[0]).toBe(0xFD);
    expect(data[1]).toBe(0xFD);
    expect(data[2]).toBe(0x02);
    expect(data[3]).toBe(0x10);
    expect(data[4]).toBe('0'.charCodeAt(0));
    expect(data[5]).toBe('0'.charCodeAt(0));
    expect(data[6]).toBe('3'.charCodeAt(0));
    expect(data[7]).toBe('E'.charCodeAt(0));
    expect(data[8]).toBe('0'.charCodeAt(0));
    expect(data[9]).toBe('0'.charCodeAt(0));
    expect(data[10]).toBe('2'.charCodeAt(0));
    expect(data[11]).toBe('8'.charCodeAt(0));
    expect(data[12]).toBe('5'.charCodeAt(0));
    expect(data[13]).toBe('7'.charCodeAt(0));
    expect(data[14]).toBe('4'.charCodeAt(0));
    expect(data[15]).toBe('2'.charCodeAt(0));
    expect(data[16]).toBe('5'.charCodeAt(0));
    expect(data[17]).toBe('7'.charCodeAt(0));
    expect(data[18]).toBe('0'.charCodeAt(0));
    expect(data[19]).toBe('F'.charCodeAt(0));
    expect(data[20]).toBe(0x04);
    expect(data[21]).toBe('1'.charCodeAt(0));
    expect(data[22]).toBe('1'.charCodeAt(0));
    expect(data[23]).toBe('1'.charCodeAt(0));
    expect(data[24]).toBe('1'.charCodeAt(0));
    expect(data[25]).toBe(FunctionType.READ);
    expect(data[26]).toBe(Parameter.READ_FIRMWARE_VERSION);
    expect(data[27]).toBe(Parameter.UNIT_TYPE);
    expect(data[28]).toBe('p'.charCodeAt(0));
    expect(data[29]).toBe(0x05);
  });

  
  it("should parse device response", async () => {
    // Arrange
    const bytes = new Uint8Array([
        0xfd,
        0xfd,
        0x02,
        0x10, 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '7'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '2'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '7'.charCodeAt(0), 
        '1'.charCodeAt(0),
        '0'.charCodeAt(0),
        0x00,
        0x06,
        0xfe,
        0x02,
        0xb9,
        0x03,
        0x00,
        0xfe,
        0x10,
        '|'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '0'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '7'.charCodeAt(0), 
        '4'.charCodeAt(0), 
        '2'.charCodeAt(0), 
        '5'.charCodeAt(0), 
        '7'.charCodeAt(0), 
        '1'.charCodeAt(0),
        '0'.charCodeAt(0),
        0xb6,
        '\t'.charCodeAt(0)]);
    
    // Act
    const packet = Packet.fromBytes(bytes);

    // Assert
    expect(packet.deviceId).toBe('0040004557425710');
    expect(packet.password).toBe('');
    expect(packet.functionType).toBe(FunctionType.RESPONSE);

    expect(packet.dataEntries.length).toBe(2);
    expect(packet.dataEntries[0].parameter).toBe(Parameter.UNIT_TYPE);
    expect(packet.dataEntries[0].value!.length).toBe(Parameter.getSize(Parameter.UNIT_TYPE));
    expect(packet.dataEntries[1].parameter).toBe(Parameter.SEARCH);
    expect(packet.dataEntries[1].value!.length).toBe(Parameter.getSize(Parameter.SEARCH));
    
  });

  

});
