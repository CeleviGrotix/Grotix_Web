import { axiosClient } from '@/shared/http/axiosClient';
import { Association } from '../domain/Association';

export const ContractsApi = {
  async getAssociations() {
    const response = await axiosClient.get('/api/v1/associations');
    const items = response.data.items || response.data || [];
    return items.map(dto => new Association(dto));
  },

  async createAssociation(data) {
    const payload = { name: data.name, email: data.email };
    const response = await axiosClient.post('/api/v1/associations', payload);
    return response.data;
  },

  // NUEVO: Crear el Contrato (Asumo que el endpoint es /api/v1/contracts, ajustalo si es diferente)
  async createContract(contractData) {
    const response = await axiosClient.post('/api/v1/contracts', contractData);
    return response.data;
  },

  // NUEVO: Enviar Invitación a Usuario (Con su Rol)
  async createInvite(associationId, inviteData) {
    const response = await axiosClient.post(`/api/v1/associations/${associationId}/invites`, inviteData);
    return response.data;
  }
};