// src/modules/catalog/application/useCatalogStore.js
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

  return { crops, currentCrop, isLoading, error, fetchCrops, fetchCropById };
});