export class Crop {
  constructor({ 
    id, cropId, // Por si el backend manda id o cropId
    commonName, 
    scientificName, 
    imageUrl, 
    maxStressTime, 
    optimalTemperature, 
    optimalHumidity, 
    optimalLight 
  }) {
    this.id = id || cropId;
    this.commonName = commonName;
    this.scientificName = scientificName || '';
    
    // Coincide con tu nuevo JSON
    this.imageUrl = imageUrl; 
    
    this.maxStressTime = maxStressTime || 0; 
    this.optimalTemperature = optimalTemperature || 0;
    this.optimalHumidity = optimalHumidity || 0;
    this.optimalLight = optimalLight || 0;
  }
}