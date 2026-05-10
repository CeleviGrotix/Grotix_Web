import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CatalogApi } from '../infrastructure/CatalogApi';

export const useCatalogStore = defineStore('catalog', () => {
  const crops = ref([]);
  const currentCrop = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchCrops() {
    isLoading.value = true;
    error.value = null;
    try {
      crops.value = await CatalogApi.getCrops();
    } catch (err) {
      error.value = 'Error al cargar el catálogo de cultivos.';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCropById(id) {
    isLoading.value = true;
    error.value = null;
    currentCrop.value = null;
    try {
      currentCrop.value = await CatalogApi.getCropById(id);
    } catch (err) {
      error.value = 'Cultivo no encontrado.';
    } finally {
      isLoading.value = false;
    }
  }

  // NUEVO: Crear un cultivo
  async function addCrop(data) {
    try {
      await CatalogApi.createCrop(data);
    } catch (err) {
      console.error(err);
      throw new Error("No se pudo crear el cultivo");
    }
  }

  async function updateCrop(id, data) {
    try {
      await CatalogApi.updateCrop(id, data);
    } catch (err) {
      console.error(err);
      throw new Error("No se pudo guardar el cultivo");
    }
  }

  async function deleteCrop(id) {
    try {
      await CatalogApi.deleteCrop(id);
      crops.value = crops.value.filter(c => c.id !== id);
    } catch (err) {
      console.error(err);
      throw new Error("No se pudo eliminar el cultivo");
    }
  }

  // No olvides exportar la nueva función "addCrop"
  return { crops, currentCrop, isLoading, error, fetchCrops, fetchCropById, addCrop, updateCrop, deleteCrop };
});