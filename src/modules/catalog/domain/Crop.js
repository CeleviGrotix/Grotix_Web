export class Crop {
  constructor({ 
    id, cropId, 
    commonName, 
    scientificName, 
    imageUrl, 
    maxStressTime, 
    optimalTemperature, 
    optimalHumidityAir,  // <-- NUEVO
    optimalHumiditySoil, // <-- NUEVO
    optimalLight 
  }) {
    this.id = id || cropId;
    this.commonName = commonName;
    this.scientificName = scientificName || '';
    this.imageUrl = imageUrl; 
    
    this.maxStressTime = maxStressTime || 0; 
    this.optimalTemperature = optimalTemperature || 0;
    this.optimalHumidityAir = optimalHumidityAir || 0;   // <-- NUEVO
    this.optimalHumiditySoil = optimalHumiditySoil || 0; // <-- NUEVO
    this.optimalLight = optimalLight || 0;
  }
}