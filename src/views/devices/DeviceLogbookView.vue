<template>
  <div class="devices-page-wrapper">
    <header class="page-header">
      <div class="header-content">
        <div class="line-decorator reverse"></div>
        <h2>Grotix Devices</h2>
        <div class="line-decorator"></div>
      </div>

      <div class="tabs-container">
        <button @click="$router.push('/devices')">LIST</button>
        <button class="active">LOGBOOK</button>
        <button @click="$router.push('/devices/maintenance')">MAINTENANCE</button>
      </div>
    </header>

    <div class="logbook-section">
      <div class="premium-device-card">
        <div class="card-header-premium mb-4">
          <h3 style="color: #10b981;">New Maintenance Log</h3>
        </div>

        <div class="form-group">
          <label>Device ID</label>
          <input
            type="text"
            v-model="logForm.deviceId"
            placeholder="e.g. 1"
            class="premium-input"
          />
        </div>

        <div class="form-group">
          <label class="accent-text">Action Performed</label>
          <textarea
            v-model="logForm.action"
            rows="5"
            placeholder="Detailed description of the maintenance..."
            class="premium-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="accent-text">Final Device Status</label>
          <div class="status-selector">
            <span
              :class="['premium-badge cursor-pointer', logForm.statusAfter === 'ONLINE' ? 'badge-success active-pulse' : 'badge-outline']"
              @click="logForm.statusAfter = 'ONLINE'"
            >
              ONLINE
            </span>
            <span
              :class="['premium-badge cursor-pointer', logForm.statusAfter === 'OFFLINE' ? 'badge-danger active-pulse' : 'badge-outline']"
              @click="logForm.statusAfter = 'OFFLINE'"
            >
              OFFLINE
            </span>
          </div>
        </div>

        <transition name="fade">
          <div v-if="errorMsg" class="error-banner">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {{ errorMsg }}
          </div>
        </transition>

        <div class="form-actions">
          <button class="btn-premium-save" :disabled="isSaving" @click="submitLog">
            {{ isSaving ? 'SAVING...' : 'SAVE LOG' }}
          </button>
          <button class="btn-premium-cancel" :disabled="isSaving" @click="resetForm">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useDeviceStore } from '@/modules/devices/application/useDeviceStore';

const deviceStore = useDeviceStore();

const logForm = reactive({ deviceId: '', action: '', statusAfter: 'ONLINE' });
const isSaving = ref(false);
const errorMsg = ref('');

const resetForm = () => { logForm.deviceId = ''; logForm.action = ''; logForm.statusAfter = 'ONLINE'; errorMsg.value = ''; };

const submitLog = async () => {
  errorMsg.value = '';
  const rawId = logForm.deviceId.toString().trim();
  const rawAction = logForm.action.trim();

  if (!rawId || !rawAction) { errorMsg.value = 'Completa el Device ID y la acción antes de guardar.'; return; }
  if (isNaN(Number(rawId)) || Number(rawId) <= 0) { errorMsg.value = 'El Device ID debe ser un número válido (ej: 1).'; return; }

  isSaving.value = true;
  try {
    await deviceStore.saveLogAndChangeStatus(rawId, { action: rawAction, statusAfter: logForm.statusAfter });
    alert('¡Log guardado y estado actualizado correctamente!');
    resetForm();
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data?.title || err?.message || 'Error desconocido.';
    errorMsg.value = `Error: ${msg}`;
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* Estilos Base Premium */
.devices-page-wrapper { padding: 2.5rem; background-color: #0c0e14; min-height: 100vh; color: #f1f1f1; font-family: 'Inter', sans-serif;}
.page-header { margin-bottom: 2.5rem; }
.header-content { display: flex; align-items: center; justify-content: center; gap: 2rem; margin-bottom: 2rem; }
.header-content h2 { font-size: 2.5rem; font-weight: 900; margin: 0; color: #fff; letter-spacing: -1px;}
.line-decorator { flex: 1; height: 3px; background: linear-gradient(90deg, #10b981, transparent); opacity: 0.8; border-radius: 4px; }
.line-decorator.reverse { background: linear-gradient(270deg, #10b981, transparent); }

/* Tabs */
.tabs-container { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #1f2937; padding-bottom: 25px;}
.tabs-container button { background: #11131a; border: 1px solid #374151; color: #a0aec0; padding: 10px 28px; border-radius: 30px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s ease; }
.tabs-container button:hover { background: #1f2937; color: #fff; border-color: #4b5563; }
.tabs-container button.active { background-color: #1a4d4e; border-color: #10b981; color: #20c997; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2); }

/* Layout & Card */
.logbook-section { max-width: 700px; margin: 0 auto; }
.premium-device-card { background-color: #11131a; border-radius: 16px; padding: 2.5rem; border: 2px solid #1f2937; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.mb-4 { margin-bottom: 2rem; }
.form-group { margin-bottom: 2rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.8rem; }
.accent-text { color: #20c997 !important; }

/* Inputs */
.premium-input { width: 100%; background-color: #1f2937; border: 2px solid #374151; color: white; padding: 14px 16px; border-radius: 10px; font-family: inherit; font-size: 1rem; box-sizing: border-box; transition: all 0.3s;}
.premium-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }

/* Badges de Formulario */
.status-selector { display: flex; gap: 15px; }
.cursor-pointer { cursor: pointer; transition: all 0.2s; padding: 10px 20px !important; font-size: 0.85rem !important;}
.premium-badge { padding: 6px 14px; border-radius: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-width: 2px; border-style: solid; }
.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981;}
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444;}
.badge-outline { border-color: #4b5563; color: #a0aec0; background: transparent; }
.badge-outline:hover { border-color: #9ca3af; color: #fff; }
.active-pulse { box-shadow: 0 0 15px currentColor; }

/* Mensajes de Error */
.error-banner { display: flex; align-items: center; gap: 10px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; border-radius: 8px; padding: 14px; font-size: 0.9rem; margin-bottom: 2rem; font-weight: 600;}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Botones Finales */
.form-actions { display: flex; gap: 15px; margin-top: 1rem; }
.btn-premium-save { background-color: #10b981; color: #0c0e14; border: none; padding: 14px 30px; border-radius: 30px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; flex: 1;}
.btn-premium-save:hover:not(:disabled) { background-color: #059669; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
.btn-premium-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-premium-cancel { background-color: transparent; color: #ef4444; border: 2px solid #ef4444; padding: 14px 30px; border-radius: 30px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; flex: 1;}
.btn-premium-cancel:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); }
</style>