import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ContractsApi } from '../infrastructure/ContractsApi';

export const useContractsStore = defineStore('contracts', () => {
  const associations = ref([]);
  const currentAssociation = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchAssociations() {
    isLoading.value = true;
    error.value = null;
    try {
      associations.value = await ContractsApi.getAssociations();
    } catch (err) {
      error.value = 'Error al cargar las asociaciones.';
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
    addContract, inviteUser 
  };
});