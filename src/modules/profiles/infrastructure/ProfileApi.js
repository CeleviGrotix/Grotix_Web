// src/modules/profiles/infrastructure/ProfileApi.js
import { axiosClient } from '@/shared/http/axiosClient';
import { Profile } from '../domain/Profile';

export const ProfileApi = {
  // Según tu Swagger, el endpoint es GET /api/v1/profile (o adaptas a la ruta de agricultores)
  async getAgriculturists() {
    const response = await axiosClient.get('/api/v1/profile');
    
    // Asumimos que el backend devuelve un array directamente o dentro de response.data.items
    const items = response.data.items || response.data || [];
    
    // ACL: Mapeo de DTO (Data Transfer Object) a Entidad de Dominio
    return items.map(dto => new Profile({
      id: dto.userId || dto.id,
      fullName: dto.fullName || `${dto.firstName} ${dto.lastName}`, // Previene si el backend manda separado
      email: dto.email || 'Sin correo',
      phone: dto.phone || 'N/A',
      association: dto.associationName || 'Grotix Independent',
      role: 'Agriculturist', // O dto.roleName
      status: dto.status,
      // Usamos un placeholder de imagen si el backend no manda avatar
      avatarUrl: dto.avatarUrl || 'https://i.pravatar.cc/150?img=' + (dto.userId || 1)
    }));
  }
};