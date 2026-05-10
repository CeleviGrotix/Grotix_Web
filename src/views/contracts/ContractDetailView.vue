<template>
  <div class="page-container" v-if="association">
    <header class="back-header" @click="$router.back()">
      <h1>&lt; Association Details</h1>
    </header>

    <div class="header-card">
      <div class="assoc-icon">🏢</div>
      <div>
        <h2 style="color: white; margin: 0; font-size: 2rem;">{{ association.name }}</h2>
        <p style="color: var(--light-grey); margin: 0;">{{ association.email }}</p>
      </div>
    </div>

    <div class="dashboard-grid">
      
      <div class="form-card">
        <h3 class="section-title">
          {{ association.hasActiveContract ? '1. Edit Contract' : '1. Generate Contract' }}
        </h3>
        <p class="subtitle">
          {{ association.hasActiveContract ? 'Update current terms or terminate the service.' : 'Assign a contract to this association (1-to-1)' }}
        </p>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Start Date</label>
            <input type="datetime-local" class="dark-input" v-model="contractForm.startDate" :disabled="association.hasActiveContract" />
          </div>
          <div class="form-group">
            <label>End Date</label>
            <input type="datetime-local" class="dark-input" v-model="contractForm.endDate" />
          </div>
          <div class="form-group">
            <label>Total Amount (USD)</label>
            <input type="number" class="dark-input" v-model="contractForm.totalAmount" />
          </div>
          <div class="form-group">
            <label>Payment Freq.</label>
            <select class="dark-input" v-model="contractForm.paymentFrequency">
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="SemiAnnual">SemiAnnual</option>
              <option value="Annual">Annual</option>
              <option value="OneTime">OneTime</option>
            </select>
          </div>
          <div class="form-group">
            <label>Max Zones</label>
            <input type="number" class="dark-input" v-model="contractForm.maxZones" />
          </div>
          <div class="form-group">
            <label>Max Microcontrollers</label>
            <input type="number" class="dark-input" v-model="contractForm.maxMicrocontrollers" />
          </div>
        </div>

        <div v-if="!association.hasActiveContract">
          <h4 style="color:var(--blue-cerulean); margin-top:1.5rem;">Org Admin Account</h4>
          <p style="color: gray; font-size: 0.85rem; margin-bottom: 1rem;">A register invitation will be sent to this email</p>
          <div class="form-group">
            <input type="email" class="dark-input" placeholder="admin@organizacion.com" v-model="contractForm.orgAdminEmail" />
          </div>
        </div>

        <div class="actions-stack" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <GtxButton variant="primary" style="width: 100%;" @click="handleContractAction">
            {{ association.hasActiveContract ? 'UPDATE CONTRACT' : 'SAVE CONTRACT' }}
          </GtxButton>

          <GtxButton v-if="association.hasActiveContract" 
                    style="width: 100%; background-color: #FF5757; color: white;" 
                    @click="handleDelete">
            TERMINATE CONTRACT
          </GtxButton>
        </div>

        <div v-if="generatedContractLink" class="magic-link-box">
          <p><strong>Link de Admin Generado:</strong></p>
          <a :href="generatedContractLink" target="_blank">{{ generatedContractLink }}</a>
        </div>
      </div>

      <div class="form-card">
        <h3 class="section-title">2. Active Members</h3>
        <p class="subtitle">Users currently registered under this association.</p>

        <div class="users-list" style="margin-top: 1rem;">
          <div v-if="isLoadingUsers" style="color: gray;">Loading members...</div>
          <div v-else-if="associatedUsers.length === 0" style="color: gray; text-align: center; padding: 2rem;">
            No users found for this organization.
          </div>
          <div v-for="user in associatedUsers" :key="user.id" 
              style="background: #2a2e30; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin: 0; color: white; font-weight: 600;">{{ user.name }}</p>
              <p style="margin: 0; color: gray; font-size: 0.8rem;">{{ user.email }}</p>
            </div>
            <span style="font-size: 0.7rem; color: var(--blue-cerulean); border: 1px solid; padding: 2px 6px; border-radius: 4px;">
              {{ user.role || 'MEMBER' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore'; // Necesitaremos esto
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const contractsStore = useContractsStore();
const profileStore = useProfileStore();

const association = computed(() => contractsStore.currentAssociation);
const associatedUsers = ref([]); // Aquí guardaremos los usuarios de la lista
const isLoadingUsers = ref(false);
const generatedContractLink = ref(''); 

const contractForm = ref({
  startDate: '', endDate: '', status: 'Active', maxZones: 1,
  maxMicrocontrollers: 100, totalAmount: 10, currency: 'USD',
  paymentFrequency: 'Monthly', isSuspended: false, orgAdminEmail: '' 
});

// Función para llenar los campos si ya hay contrato
const syncFormWithContract = () => {
  if (association.value?.hasActiveContract) {
    const a = association.value;
    contractForm.value = {
      startDate: a.contractStart ? a.contractStart.slice(0, 16) : '',
      endDate: a.contractEnd ? a.contractEnd.slice(0, 16) : '',
      status: a.status || 'Active',
      maxZones: a.maxZones || 1,
      maxMicrocontrollers: a.maxMicrocontrollers || 100,
      totalAmount: a.totalAmount || 10,
      currency: 'USD',
      paymentFrequency: a.paymentFrequency || 'Monthly',
      isSuspended: a.isSuspended || false
    };
  }
};

onMounted(async () => {
  const id = route.params.id;
  await contractsStore.loadAssociationById(id);
  syncFormWithContract();
  
  // Cargar usuarios de esta asociación
  fetchAssociatedUsers(id);
});

const fetchAssociatedUsers = async (id) => {
  isLoadingUsers.value = true;
  try {
    await profileStore.fetchProfiles(); 
    
    associatedUsers.value = profileStore.profiles.filter(p => {
      // Buscamos la propiedad sin importar si es associationId, associationID o AssociationId
      const assocId = p.associationId || p.associationID || p.AssociationId;
      return String(assocId) === String(id);
    });
  } finally {
    isLoadingUsers.value = false;
  }
};

const handleContractAction = async () => {
  if (association.value.hasActiveContract) {
    // ACCIÓN: UPDATE (PATCH)
    try {
      // Solo enviamos los campos que definimos en UpdateContractRequest
      const payload = {
        // Formateamos la fecha a ISO si existe, o null si está vacía
        endDate: contractForm.value.endDate || null, 
        status: contractForm.value.status,
        maxZones: contractForm.value.maxZones,
        maxMicrocontrollers: contractForm.value.maxMicrocontrollers,
        isSuspended: contractForm.value.isSuspended,
        totalAmount: contractForm.value.totalAmount,
        paymentFrequency: contractForm.value.paymentFrequency
      };

      await contractsStore.updateContract(association.value.contractId, payload);
      alert("Contract updated successfully!");
    } catch (err) { 
      // Mostramos el error real del backend si nos responde
      const msg = err.response?.data?.message || "Failed to update contract.";
      alert(msg); 
    }
  } else {
    // ACCIÓN: CREATE
    handleCreateContract();
  }
};
const handleDelete = async () => {
  if (confirm("Are you sure you want to DEACTIVATE this contract? It will be suspended but the record will remain.")) {
    try {
      await contractsStore.deleteContract(association.value.contractId);
      alert("Contract has been deactivated and suspended.");
      
      // Actualizamos el estado local para que los inputs se marquen como suspendidos
      contractForm.value.isSuspended = true;
      contractForm.value.status = 'Canceled';
    } catch (err) { alert("Error deactivating contract."); }
  }
};

const handleCreateContract = async () => {
  if (!contractForm.value.orgAdminEmail) {
    alert("El correo del administrador es obligatorio.");
    return;
  }
  try {
    const payload = { ...contractForm.value, associationId: Number(association.value.id) };
    if(payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
    if(payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();

    // 1. Capturamos la respuesta del backend
    const response = await contractsStore.addContract(payload);
    
    // 2. Extraemos el token del admin que viene en el JSON
    const token = response.orgAdminInviteToken;
    
    // 3. Generamos el link de registro local
    generatedContractLink.value = `${window.location.origin}/register?email=${payload.orgAdminEmail}&token=${token}`;
    
    alert('¡Contrato creado! Copia el link generado debajo del botón.');
  } catch (err) {
    console.error(err);
    alert('Error al crear el contrato.');
  }
};

const handleInvite = async () => {
  if (!inviteForm.value.email) {
    alert("El correo es obligatorio para enviar la invitación.");
    return;
  }
  try {
    const payload = { ...inviteForm.value };
    if(payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt).toISOString();

    // 1. Capturamos la respuesta del backend
    const response = await contractsStore.inviteUser(association.value.id, payload);
    
    // 2. Extraemos el token de la invitación que viene en el JSON
    const token = response.token;
    
    // 3. Generamos el link de registro local
    generatedInviteLink.value = `${window.location.origin}/register?email=${payload.email}&token=${token}`;
    
    alert(`¡Invitación enviada a ${payload.email}! Copia el link generado debajo.`);
    inviteForm.value.email = ''; // Limpiamos el campo de email para futuras invitaciones
  } catch (err) {
    console.error(err);
    alert('Error al generar la invitación.');
  }
};
</script>

<style scoped>
.page-container { padding-bottom: 2rem; width: 100%; }
.back-header { cursor: pointer; margin-bottom: 2rem; display: inline-block; }
.back-header h1 { font-size: 2rem; font-weight: 700; color: var(--white); margin: 0; }
.back-header:hover { opacity: 0.8; }
.header-card { display: flex; align-items: center; gap: 1.5rem; background-color: #161819; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; }
.assoc-icon { font-size: 4rem; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
@media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } }
.form-card { background-color: #161819; padding: 2rem; border-radius: 16px; }
.section-title { color: var(--white); margin: 0 0 0.5rem 0; font-size: 1.5rem; border-bottom: 1px solid #2a2e30; padding-bottom: 0.5rem; }
.subtitle { color: var(--light-grey); font-size: 0.9rem; margin-bottom: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; color: var(--emerald-green); margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;}
.dark-input { width: 100%; padding: 10px; border-radius: 8px; background-color: #2a2e30; border: none; color: white; outline: none; font-family: var(--font-main); }

/* ESTILOS PARA LA CAJA MÁGICA DEL LINK */
.magic-link-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(1, 160, 112, 0.1);
  border: 1px dashed var(--emerald-green);
  border-radius: 8px;
  word-break: break-all;
}
.magic-link-box p { margin: 0 0 0.5rem 0; color: var(--emerald-green); font-size: 0.9rem;}
.magic-link-box a { color: var(--blue-cerulean); text-decoration: none; font-size: 0.85rem;}
.magic-link-box a:hover { text-decoration: underline; }
</style>