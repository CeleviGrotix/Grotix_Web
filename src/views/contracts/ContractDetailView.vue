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
        <h3 class="section-title">1. Generate Contract</h3>
        <p class="subtitle">Assign a contract to this association (1-to-1)</p>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Start Date</label>
            <input type="datetime-local" class="dark-input" v-model="contractForm.startDate" />
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
              <option value="Yearly">Yearly</option>
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

        <h4 style="color:var(--blue-cerulean); margin-top:1.5rem;">Org Admin Account</h4>
        <p style="color: gray; font-size: 0.85rem; margin-bottom: 1rem;">Se enviará una invitación a este correo para que cree su cuenta.</p>
        <div class="form-group">
          <input type="email" class="dark-input" placeholder="admin@organizacion.com" v-model="contractForm.orgAdminEmail" />
        </div>

        <GtxButton variant="primary" style="margin-top: 1rem; width: 100%;" @click="handleCreateContract">SAVE CONTRACT</GtxButton>

        <div v-if="generatedContractLink" class="magic-link-box">
          <p><strong>Link de Admin Generado:</strong></p>
          <a :href="generatedContractLink" target="_blank">{{ generatedContractLink }}</a>
        </div>
      </div>

      <div class="form-card">
        <h3 class="section-title">2. Create / Invite Users</h3>
        <p class="subtitle">Send an email invite to join this Association</p>

        <div class="form-group" style="margin-top: 1.5rem;">
          <label>User Email</label>
          <input type="email" class="dark-input" v-model="inviteForm.email" placeholder="trabajador@correo.com" />
        </div>

        <div class="form-group">
          <label>Select Role</label>
          <select class="dark-input" v-model="inviteForm.roleId">
            <option :value="3">User Admin (Gestor)</option>
            <option :value="4">User Basic (Agricultor Básico)</option>
            <option :value="5">User Advanced (Agricultor Avanzado)</option>
          </select>
          <small style="color: gray; display: block; margin-top: 5px;">*Solo puedes asignar roles inferiores al tuyo.</small>
        </div>

        <div class="form-group">
          <label>Invitation Expiration Date</label>
          <input type="datetime-local" class="dark-input" v-model="inviteForm.expiresAt" />
        </div>

        <GtxButton variant="outline" style="margin-top: 1rem; width: 100%; border-color: var(--emerald-green); color: var(--emerald-green);" @click="handleInvite">
          SEND INVITATION
        </GtxButton>

        <div v-if="generatedInviteLink" class="magic-link-box">
          <p><strong>Link de Usuario Generado:</strong></p>
          <a :href="generatedInviteLink" target="_blank">{{ generatedInviteLink }}</a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const contractsStore = useContractsStore();
const association = computed(() => contractsStore.currentAssociation);

// Variables reactivas para almacenar los links
const generatedContractLink = ref(''); 
const generatedInviteLink = ref('');

const contractForm = ref({
  startDate: '',
  endDate: '',
  status: 'Draft',
  maxZones: 1,
  maxMicrocontrollers: 100,
  totalAmount: 10,
  currency: 'USD',
  paymentFrequency: 'Monthly',
  isSuspended: false,
  orgAdminEmail: '' 
});

const inviteForm = ref({
  email: '', 
  roleId: 4,
  expiresAt: ''
});

onMounted(async () => {
  await contractsStore.loadAssociationById(route.params.id);
});

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