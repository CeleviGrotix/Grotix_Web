export class Association {
  constructor(data, contract = null) {
    this.id = data.id || data.associationId;
    this.name = data.name || 'Sin Nombre';
    this.email = data.email || 'Sin correo';
    
    // Si le pasamos un contrato, extraemos las fechas con los nombres del JSON
    if (contract) {
      this.contractId = contract.id || contract.contractId;
      this.contractStart = contract.startDate;
      this.contractEnd = contract.endDate;
      this.status = contract.status;
      this.maxZones = contract.maxZones;
      this.maxMicrocontrollers = contract.maxMicrocontrollers;
      this.totalAmount = contract.totalAmount;
      this.paymentFrequency = contract.paymentFrequency;
      this.hasActiveContract = true;;
    } else {
      this.contractStart = null;
      this.contractEnd = null;
      this.hasActiveContract = false;
    }
  }

getFormattedDateRange() {
    if (!this.contractStart) return 'Sin fecha definida';
    
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const start = new Date(this.contractStart).toLocaleDateString('es-PE', options);
      
      // Si no hay fecha de fin, mostramos "Vigente"
      const end = this.contractEnd 
        ? new Date(this.contractEnd).toLocaleDateString('es-PE', options) 
        : 'Vigente';
        
      return `${start} - ${end}`;
    } catch (e) {
      return 'Fecha inválida';
    }
  }
}