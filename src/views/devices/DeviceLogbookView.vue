<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Devices</h2>
        <div class="line-decorator"></div>
      </div>
      
      <div class="tabs-container">
        <button @click="$router.push('/devices')">LIST</button>
        <button class="active">LOGBOOK</button>
        <button @click="$router.push('/devices/maintenance')">MAINTENANCE</button>
      </div>
    </header>

    <div class="logbook-section">
      <div class="logbook-card">
        <div class="form-group">
          <label>Device ID</label>
          <input type="text" v-model="logForm.deviceId" placeholder="Ej: 1" class="dark-input">
        </div>
        
        <div class="form-group">
          <label class="green-text">Action</label>
          <textarea v-model="logForm.action" rows="4" placeholder="Limpieza de sensor..." class="dark-input"></textarea>
        </div>

        <div class="form-group">
          <label class="green-text">Status After</label>
          <div class="status-selector">
             <span :class="['badge', logForm.statusAfter === 'ONLINE' ? 'badge-success' : 'badge-outline']"
               @click="logForm.statusAfter = 'ONLINE'" style="cursor:pointer;">ONLINE</span>
             <span :class="['badge', logForm.statusAfter === 'OFFLINE' ? 'badge-danger' : 'badge-outline']"
               @click="logForm.statusAfter = 'OFFLINE'" style="cursor:pointer;">OFFLINE</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-save" @click="submitLog">SAVE</button>
          <button class="btn-cancel" @click="resetForm">CANCEL</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const deviceStore = useDeviceStore();
const logForm = ref({ deviceId: '', action: '', statusAfter: 'ONLINE' });

const resetForm = () => { logForm.value = { deviceId: '', action: '', statusAfter: 'ONLINE' }; };

const submitLog = async () => {
  if (!logForm.deviceId || !logForm.action) return alert("Llena los campos");
  try {
    await deviceStore.saveLog(logForm.deviceId, { action: logForm.action, statusAfter: logForm.statusAfter });
    await deviceStore.changeStatus(logForm.deviceId, logForm.statusAfter);
    await deviceStore.fetchDevices(); // Fuerza recarga de la lista
    alert("¡Guardado y estado actualizado!");
    resetForm();
  } catch (error) {
    alert("Error. Verifica que el ID exista.");
  }
};
</script>

<style scoped>
/* Estilos omitidos por brevedad pero son los mismos de siempre */
.devices-page-wrapper { padding: 2rem; background-color: #0f111a; min-height: 100vh; color: #fff; font-family: 'Inter', sans-serif;}
.page-header { margin-bottom: 2rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; }
.header-content h2 { font-size: 2.2rem; font-weight: 800; margin: 0; }
.line-decorator { flex: 1; height: 2px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.7;}
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent);}
.tabs-container { display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #2d3748; padding-bottom: 20px; }
.tabs-container button { background: transparent; border: 1px solid #fff; color: #fff; padding: 8px 24px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer; }
.tabs-container button.active { background-color: #1a4d4e; color: #20c997; }
.logbook-section { max-width: 800px; margin: 0 auto; }
.logbook-card { background-color: #161819; border-radius: 12px; padding: 2rem; border: 1px solid #2d3748;}
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; color: #3182ce; font-size: 0.9rem; font-weight: bold; margin-bottom: 0.5rem; }
.green-text { color: #10b981 !important; }
.dark-input { width: 100%; background-color: #2d3748; border: none; color: white; padding: 12px; border-radius: 6px; }
.status-selector { display: flex; gap: 10px;}
.badge { padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
.badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981;}
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;}
.badge-outline { border: 1px solid #fff; color: #fff; }
.form-actions { display: flex; gap: 15px; margin-top: 2rem; }
.btn-save { background-color: #1a4d4e; color: #20c997; border: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; }
.btn-cancel { background-color: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 10px 24px; border-radius: 20px; font-weight: bold; cursor: pointer; }
</style>