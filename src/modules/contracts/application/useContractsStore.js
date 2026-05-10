import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ContractsApi } from '../infrastructure/ContractsApi';
import { axiosClient } from '@/shared/http/axiosClient';
import { Association } from '../domain/Association';

export const useContractsStore = defineStore('contracts', () => {
  const associations = ref([]);
  const currentAssociation = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

async function fetchAssociations() {
  isLoading.value = true;
  error.value = null;
  try {
    // 1. Traemos asociaciones y contratos al mismo tiempo
    const [assocData, contractsData] = await Promise.all([
      ContractsApi.getAssociations(),
      axiosClient.get('/api/v1/contracts').then(res => res.data) // Traemos la lista de contratos
    ]);

    const rawContracts = contractsData.items || contractsData || [];

      associations.value = assocData.map(assoc => {
        // Comparamos IDs convirtiéndolos a String para evitar errores (1 vs "1")
        const matchingContract = rawContracts.find(c => 
          String(c.associationId) === String(assoc.id)
        );
        
        return new Association(assoc, matchingContract);
      });

  } catch (err) {
    console.error(err);
    error.value = 'Error al sincronizar contratos.';
  } finally {
    isLoading.value = false;
  }
}

  // Busca en la memoria local o hace un fetch si recargan la página
  async function loadAssociationById(id) {
    if (associations.value.length === 0) {
      await fetchAssociations();
    }
    // Buscamos la asociación por ID asegurando que los tipos coincidan (Number vs String)
    currentAssociation.value = associations.value.find(a => String(a.id) === String(id));
  }

  async function addAssociation(data) {
    await ContractsApi.createAssociation(data);
  }

  async function addContract(contractData) {
    // Agregamos el "return" para devolver la respuesta a la vista
    return await ContractsApi.createContract(contractData);
  }

  // Editar un contrato existente
  async function updateContract(contractId, contractData) {
    try {
      const response = await axiosClient.patch(`/api/v1/contracts/${contractId}`, contractData);
      
      // Actualizamos el contrato en la memoria local para que la UI reaccione
      if (currentAssociation.value && currentAssociation.value.contractStart) {
        currentAssociation.value.contractEnd = response.data.endDate;
      }
      await fetchAssociations(); // Refrescamos la lista principal
      return response.data;
    } catch (err) {
      console.error("Error al actualizar el contrato:", err);
      throw err;
    }
  }

  // Eliminar un contrato (Dar de baja)
  async function deleteContract(contractId) {
    try {
      await axiosClient.delete(`/api/v1/contracts/${contractId}`);
      
      if (currentAssociation.value) {
        // ❌ BORRA ESTAS LÍNEAS ❌
        // currentAssociation.value.hasActiveContract = false; 
        // currentAssociation.value.contractStart = null;
        // currentAssociation.value.contractEnd = null;

        // ✅ AGREGA ESTAS ✅
        currentAssociation.value.status = 'Canceled';
        currentAssociation.value.isSuspended = true;
      }
      await fetchAssociations(); 
    } catch (err) {
      console.error("Error al eliminar el contrato:", err);
      throw err;
    }
  }

  async function inviteUser(associationId, inviteData) {
  try {
    // Retornamos lo que nos da la API (que incluye el token)
    return await ContractsApi.createInvite(associationId, inviteData);
  } catch (err) {
    console.error(err);
    throw new Error("No se pudo generar la invitación");
  }
  }

  return { 
    associations, currentAssociation, isLoading, error, 
    fetchAssociations, loadAssociationById, addAssociation, 
    addContract, inviteUser, updateContract, deleteContract
  };
});