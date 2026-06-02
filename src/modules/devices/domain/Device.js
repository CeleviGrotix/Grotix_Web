export class Device {
  constructor(dto = {}) {
    this.id = dto.id || '';
    this.model = dto.model || 'Microcontroller';
    this.macAddress = dto.macAddress || '';
    this.zoneId = dto.zoneId || null;
    this.status = dto.status || 'OFFLINE';
    this.lastSeen = dto.lastSeen || null;
    this.lastMaintenance = dto.lastMaintenance || null;
    this.isUnderMaintenance = dto.isUnderMaintenance || false;
  }
}