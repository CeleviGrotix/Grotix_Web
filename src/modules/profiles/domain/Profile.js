export class Profile {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || 'Usuario Sin Nombre';
    this.email = data.email || 'Sin correo';
    this.phone = data.phone || 'Sin teléfono';
    
    this.roleId = data.roleId;
    
    // Diccionario de roles basado exactamente en tu base de datos MySQL
    const roleMap = {
      1: 'Admin',
      2: 'Staff',
      3: 'User Admin',
      4: 'User Basic',
      5: 'User Advanced'
    };
    
    // Si el roleId existe en el diccionario, lo asignamos. Si no, le ponemos 'Desconocido'
    this.roleName = roleMap[this.roleId] || 'Unknown Role'; 
    
    this.association = data.associationId ? `Asociación ID: ${data.associationId}` : 'Ninguna';
    this.profilePicture = data.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
    this.isActive = true; 
  }
}