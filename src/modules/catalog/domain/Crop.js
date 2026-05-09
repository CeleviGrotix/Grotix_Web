// src/modules/catalog/domain/Crop.js
export class Crop {
  constructor({ 
    id, 
    commonName, 
    scientificName, 
    photoUrl, 
    maxStressTime, 
    optimalTemperature, 
    optimalHumidity, 
    optimalLight 
  }) {
    this.id = id;
    this.commonName = commonName;
    this.scientificName = scientificName;
    
    // Mantenemos la foto para el UI, aunque el backend no la mande aún
    this.photoUrl = photoUrl; 
    
    // Todos estos ahora son números limpios, tal como dicta tu JSON
    this.maxStressTime = maxStressTime || 0; 
    this.optimalTemperature = optimalTemperature || 0;
    this.optimalHumidity = optimalHumidity || 0;
    this.optimalLight = optimalLight || 0;
  }
}