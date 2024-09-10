import {BlaubergVentoResource} from '../src/resource/blauberg-vento-resource';
import { Mode } from '../src/resource/mode';


describe("test resource", () => {
  
  
  it("should find devices", async () => {
    // Arrange
    const resource = new BlaubergVentoResource();
    
    // Act
    const result = await resource.findAll();
    
    // Assert
    console.log(result);
    /**for(var device of result.content) {
      device.speed = 1;
      device.mode = Mode.IN;
      await resource.save(device);
    }*/
    expect(result.totalElements).toBe(2);
    expect(result.content[0].on).toBeTruthy();
  });


});
