export class Association {
  constructor(data) {
    this.id = data.id || data.associationId;
    this.name = data.name || 'Sin Nombre';
    this.email = data.email || 'Sin correo';
  }
}