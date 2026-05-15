<template>
  <div class="page-container">
    <div v-if="!association" style="color: gray; padding: 2rem;">Loading association...</div>

    <template v-else>
      <header class="back-header" @click="$router.back()">
        <h1>Association Details</h1>
      </header>

      <div class="header-card">
        <div class="assoc-icon">🏢</div>
        <div>
          <h2 class="assoc-name">{{ association.name }}</h2>
          <p class="assoc-email">{{ association.email }}</p>
        </div>
      </div>

      <div class="dashboard-grid">

        <!-- CARD 1: Contract -->
        <div class="form-card">
          <h3 class="section-title">
            {{ association.hasActiveContract ? '1. Edit Contract' : '1. Generate Contract' }}
          </h3>
          <p class="subtitle">
            {{ association.hasActiveContract
              ? 'Update current terms or terminate the service.'
              : 'Assign a contract to this association (1-to-1)' }}
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
            <h4 class="admin-title">Org Admin Account</h4>
            <p class="admin-subtitle">A register invitation will be sent to this email</p>
            <div class="form-group">
              <input type="email" class="dark-input" placeholder="admin@organizacion.com" v-model="contractForm.orgAdminEmail" />
            </div>
          </div>

          <div class="action-buttons">
            <GtxButton
              variant="primary"
              style="width: 100%;"
              :style="isCanceled ? 'background-color: #4FD16C; color: #1a1a1a;' : ''"
              @click="handleContractAction"
            >
              {{ isCanceled ? 'REACTIVATE CONTRACT' : association.hasActiveContract ? 'UPDATE CONTRACT' : 'SAVE CONTRACT' }}
            </GtxButton>

            <GtxButton
              v-if="association.hasActiveContract && !isCanceled"
              style="width: 100%; background-color: #FF5757; color: white;"
              @click="handleDelete"
            >
              TERMINATE CONTRACT
            </GtxButton>
          </div>

          <div v-if="generatedContractLink" class="magic-link-box">
            <p><strong>Generated Admin Link:</strong></p>
            <a :href="generatedContractLink" target="_blank">{{ generatedContractLink }}</a>
          </div>
        </div>

        <!-- CARD 2: Members -->
        <div class="form-card">
          <h3 class="section-title">2. Active Members</h3>
          <p class="subtitle">Users currently registered under this association.</p>

          <div class="users-list">
            <div v-if="isLoadingUsers" style="color: gray;">Loading members...</div>
            <div v-else-if="associatedUsers.length === 0" class="empty-members">
              No users found for this organization.
            </div>
            <div
              v-for="user in associatedUsers"
              :key="user.id"
              class="user-item-clickable"
              @click="goToUserProfile(user.id)"
            >
              <div>
                <p class="user-name">{{ user.name }}</p>
                <p class="user-email">{{ user.email }}</p>
              </div>
              <span class="user-role-badge">{{ user.role || 'MEMBER' }}</span>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractsStore } from '@/modules/contracts/application/useContractsStore';
import { useProfileStore } from '@/modules/profiles/application/useProfileStore';
import GtxButton from '@/shared/ui/GtxButton.vue';

const route = useRoute();
const router = useRouter();
const contractsStore = useContractsStore();
const profileStore = useProfileStore();

const association = computed(() => contractsStore.currentAssociation);
const associatedUsers = ref([]);
const isLoadingUsers = ref(false);
const generatedContractLink = ref('');

const contractForm = ref({
  startDate: '', endDate: '', status: 'Active',
  maxZones: 1, maxMicrocontrollers: 100, totalAmount: 10,
  currency: 'USD', paymentFrequency: 'Monthly',
  isSuspended: false, orgAdminEmail: '',
});

const isCanceled = computed(() => {
  const status = association.value?.status;
  const suspended = association.value?.isSuspended;
  return status === 'Canceled' || suspended === true;
});

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
      isSuspended: a.isSuspended || false,
      orgAdminEmail: '',
    };
  }
};

const fetchAssociatedUsers = async (id) => {
  isLoadingUsers.value = true;
  try {
    await profileStore.fetchProfiles();
    associatedUsers.value = profileStore.profiles.filter((p) => {
      const assocId = p.associationId ?? p.associationID ?? p.AssociationId;
      return String(assocId) === String(id);
    });
  } finally {
    isLoadingUsers.value = false;
  }
};

const goToUserProfile = (userId) => router.push(`/profiles/${userId}`);

const handleContractAction = async () => {
  if (association.value.hasActiveContract) {
    try {
      const payload = {
        endDate: contractForm.value.endDate,
        maxZones: contractForm.value.maxZones,
        maxMicrocontrollers: contractForm.value.maxMicrocontrollers,
        totalAmount: contractForm.value.totalAmount,
        paymentFrequency: contractForm.value.paymentFrequency,
        status: isCanceled.value ? 'Active' : contractForm.value.status,
        isSuspended: isCanceled.value ? false : contractForm.value.isSuspended,
      };
      await contractsStore.updateContract(association.value.contractId, payload);
      alert(isCanceled.value ? 'Contract reactivated!' : 'Contract updated!');
      association.value.status = payload.status;
      association.value.isSuspended = payload.isSuspended;
    } catch { alert('Action failed.'); }
  } else {
    await handleCreateContract();
  }
};

const handleDelete = async () => {
  if (!confirm('Are you sure you want to TERMINATE this contract?')) return;
  try {
    await contractsStore.deleteContract(association.value.contractId);
    alert('Contract has been deactivated and suspended.');
    contractForm.value.isSuspended = true;
    contractForm.value.status = 'Canceled';
    association.value.status = 'Canceled';
    association.value.isSuspended = true;
  } catch { alert('Error deactivating contract.'); }
};

const handleCreateContract = async () => {
  if (!contractForm.value.orgAdminEmail) { alert('Admin email is required.'); return; }
  try {
    const payload = { ...contractForm.value, associationId: Number(association.value.id) };
    if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
    if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
    const response = await contractsStore.addContract(payload);
    const token = response.orgAdminInviteToken;
    generatedContractLink.value = `${window.location.origin}/register?email=${payload.orgAdminEmail}&token=${token}`;
    alert('Contract created! Copy the link generated below.');
  } catch (err) { console.error(err); alert('Error creating contract.'); }
};

onMounted(async () => {
  const id = route.params.id;
  await contractsStore.loadAssociationById(id);
  syncFormWithContract();
  fetchAssociatedUsers(id);
});
</script>

<style scoped>
.page-container {
  padding-bottom: 2rem;
  width: 100%;
}

/* --- BACK HEADER --- */
.back-header {
  cursor: pointer;
  margin-bottom: 2rem;
  display: inline-block;
}
.back-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}
.back-header:hover { opacity: 0.8; }

/* --- HEADER CARD --- */
.header-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: #161819;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}
.assoc-icon { font-size: 4rem; flex-shrink: 0; }
.assoc-name { color: white; margin: 0; font-size: 2rem; }
.assoc-email { color: var(--light-grey); margin: 0; }

/* --- GRID 2 COLUMNAS --- */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* --- FORM CARD --- */
.form-card {
  background-color: #161819;
  padding: 2rem;
  border-radius: 16px;
}

.section-title {
  color: var(--white);
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  border-bottom: 1px solid #2a2e30;
  padding-bottom: 0.5rem;
}

.subtitle {
  color: var(--light-grey);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group { margin-bottom: 1rem; }

.form-group label {
  display: block;
  color: var(--emerald-green);
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.dark-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background-color: #2a2e30;
  border: none;
  color: white;
  outline: none;
  font-family: var(--font-main);
  box-sizing: border-box;
}

.admin-title {
  color: var(--blue-cerulean);
  margin-top: 1.5rem;
}

.admin-subtitle {
  color: gray;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.action-buttons {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* --- MAGIC LINK --- */
.magic-link-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(1, 160, 112, 0.1);
  border: 1px dashed var(--emerald-green);
  border-radius: 8px;
  word-break: break-all;
}
.magic-link-box p { margin: 0 0 0.5rem 0; color: var(--emerald-green); font-size: 0.9rem; }
.magic-link-box a { color: var(--blue-cerulean); text-decoration: none; font-size: 0.85rem; }
.magic-link-box a:hover { text-decoration: underline; }

/* --- MEMBERS --- */
.users-list { margin-top: 1rem; }

.empty-members {
  color: gray;
  text-align: center;
  padding: 2rem;
}

.user-item-clickable {
  background: #2a2e30;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}
.user-item-clickable:hover {
  background-color: #363b3e;
  transform: translateX(5px);
  border-left: 4px solid var(--blue-cerulean);
}

.user-name { margin: 0; color: white; font-weight: 600; }
.user-email { margin: 0; color: gray; font-size: 0.8rem; }
.user-role-badge {
  font-size: 0.7rem;
  color: var(--blue-cerulean);
  border: 1px solid var(--blue-cerulean);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* ============================================================
   TABLET (≤ 1024px)
   ============================================================ */
@media (max-width: 1024px) {
  .back-header h1 { font-size: 1.75rem; }
  .assoc-name { font-size: 1.5rem; }
}

/* ============================================================
   MÓVIL (≤ 768px): grid a 1 columna
   ============================================================ */
@media (max-width: 768px) {
  .back-header h1 { font-size: 1.4rem; }

  .header-card {
    padding: 1.25rem;
    gap: 1rem;
  }

  .assoc-icon { font-size: 2.5rem; }
  .assoc-name { font-size: 1.25rem; }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .form-card { padding: 1.25rem; }

  /* El form-grid también a 1 columna en móvil */
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-title { font-size: 1.2rem; }
}

/* ============================================================
   MÓVIL PEQUEÑO (≤ 480px)
   ============================================================ */
@media (max-width: 480px) {
  .header-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .user-item-clickable {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>