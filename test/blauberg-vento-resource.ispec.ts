import {BlaubergVentoResource} from '../src/blauberg-vento-resource';


describe("test resource", () => {
  
  
  it("should find devices", async () => {
    // Arrange
    const resource = new BlaubergVentoResource();
    
    // Act
    const result = await resource.findAll();

    // Assert
    console.log(result);
    expect(result.totalElements).toBe(2);
    expect(result.content[0].on).toBeTruthy();
  });


});
