import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ContractsApi } from '../infrastructure/ContractsApi';
import { FarmApi } from '@/modules/farms/infrastructure/FarmApi';
import { ZoneApi } from '@/modules/farms/infrastructure/ZoneApi';
import { axiosClient } from '@/shared/http/axiosClient';
import { Association } from '../domain/Association';

export const useContractsStore = defineStore('contracts', () => {
  const associations = ref([]);
  const currentAssociation = ref(null);
  const currentFarm = ref(null);
  const farmZones = ref([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isLoadingZones = ref(false);
  const isSavingZone = ref(false);
  const error = ref(null);
  const zoneError = ref(null);

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

  function syncCurrentAssociationFromList(id) {
    const targetId = id ?? currentAssociation.value?.id;
    if (!targetId) return;
    currentAssociation.value =
      associations.value.find((a) => String(a.id) === String(targetId)) ?? null;
  }

  async function refreshAssociationById(id) {
    await fetchAssociations();
    syncCurrentAssociationFromList(id);
    return currentAssociation.value;
  }

  // Busca en la memoria local o hace un fetch si recargan la página
  async function loadAssociationById(id) {
    if (associations.value.length === 0) {
      await fetchAssociations();
    }
    syncCurrentAssociationFromList(id);
  }

  async function loadZonesForFarm(farmId) {
    if (!farmId) {
      farmZones.value = [];
      return [];
    }

    isLoadingZones.value = true;
    zoneError.value = null;
    try {
      farmZones.value = await ZoneApi.listByFarm(farmId);
      return farmZones.value;
    } catch (err) {
      console.error(err);
      zoneError.value = err.response?.data?.message || 'Error loading zones.';
      farmZones.value = [];
      return [];
    } finally {
      isLoadingZones.value = false;
    }
  }

  async function addZone(farmId, payload) {
    isSavingZone.value = true;
    zoneError.value = null;
    try {
      const zone = await ZoneApi.createZone(farmId, payload);
      await loadZonesForFarm(farmId);
      return zone;
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Error creating zone.';
      zoneError.value = message;
      throw new Error(message);
    } finally {
      isSavingZone.value = false;
    }
  }

  async function loadFarmForAssociation(associationId) {
    const farms = await FarmApi.getByAssociationId(associationId);
    currentFarm.value = farms[0] ?? null;
    return currentFarm.value;
  }

  async function addAssociation({ name, email, location }) {
    isSaving.value = true;
    error.value = null;
    try {
      const assoc = await ContractsApi.createAssociation({ name, email });
      const associationId = assoc.id;

      if (!associationId) {
        throw new Error('Association was created but no id was returned.');
      }

      const existingFarms = await FarmApi.getByAssociationId(associationId);
      if (existingFarms.length > 0) {
        throw new Error('This association already has a farm.');
      }

      await FarmApi.createFarm({
        associationId,
        name,
        location,
      });

      await fetchAssociations();
      return assoc;
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Error creating association or farm.';
      error.value = message;
      throw new Error(message);
    } finally {
      isSaving.value = false;
    }
  }

  async function addContract(contractData) {
    // Agregamos el "return" para devolver la respuesta a la vista
    return await ContractsApi.createContract(contractData);
  }

  // Editar un contrato existente
  async function updateContract(contractId, contractData) {
    try {
      const response = await axiosClient.patch(`/api/v1/contracts/${contractId}`, contractData);
      const associationId = currentAssociation.value?.id;
      await fetchAssociations();
      syncCurrentAssociationFromList(associationId);
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
      const associationId = currentAssociation.value?.id;
      await fetchAssociations();
      syncCurrentAssociationFromList(associationId);
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
    associations,
    currentAssociation,
    currentFarm,
    farmZones,
    isLoading,
    isSaving,
    isLoadingZones,
    isSavingZone,
    error,
    zoneError,
    fetchAssociations,
    loadAssociationById,
    refreshAssociationById,
    loadFarmForAssociation,
    loadZonesForFarm,
    addZone,
    addAssociation,
    addContract,
    inviteUser,
    updateContract,
    deleteContract,
  };
});