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

      <div v-if="isLoadingFarm" class="farm-banner">Loading farm...</div>
      <div v-else-if="farm" class="farm-banner">
        <div>
          <span class="farm-label">Registered Farm</span>
          <h3 class="farm-name">{{ farm.name }}</h3>
          <p class="farm-location">{{ farm.location }}</p>
        </div>
      </div>
      <div v-else class="farm-banner farm-missing">
        <p>No farm found for this association.</p>
      </div>

      <div class="dashboard-grid">

        <div class="dashboard-column">
          <!-- Contract -->
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

          <!-- Zones -->
          <div v-if="farm" class="form-card zones-section">
            <h3 class="section-title">2. Cultivation Zones</h3>
            <p class="subtitle">
              Zones belong to this association's farm.
              <span v-if="zoneLimitLabel"> ({{ zoneLimitLabel }})</span>
            </p>

            <div v-if="isLoadingZones" class="empty-zones">Loading zones...</div>
            <div v-else-if="farmZones.length === 0" class="empty-zones">
              No zones registered yet.
            </div>
            <div v-else class="zones-list">
              <div
                v-for="zone in farmZones"
                :key="zone.id"
                class="zone-item zone-item-clickable"
                @click="goToZone(zone.id)"
              >
                <div>
                  <p class="zone-name">{{ zone.name }}</p>
                  <p class="zone-meta">
                    Crop: {{ cropLabel(zone.cropId) }} · {{ zone.irrigationMode || 'AUTOMATIC' }}
                  </p>
                  <p class="zone-coords">{{ zone.latitude }}, {{ zone.longitude }}</p>
                </div>
                <span class="zone-id">#{{ zone.id }} →</span>
              </div>
            </div>

            <div v-if="!canAddZone" class="zone-limit-msg">
              {{ zoneLimitMessage }}
            </div>

            <div v-else class="zone-form">
              <h4 class="admin-title">Add Zone</h4>

              <div class="form-grid">
                <div class="form-group">
                  <label>Zone Name</label>
                  <input type="text" class="dark-input" v-model="zoneForm.name" placeholder="Ej: Invernadero A" />
                </div>
                <div class="form-group">
                  <label>Crop</label>
                  <select class="dark-input" v-model.number="zoneForm.cropId">
                    <option :value="0" disabled>Select crop</option>
                    <option v-for="crop in crops" :key="crop.id" :value="crop.id">
                      {{ crop.commonName }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Latitude</label>
                  <input type="number" step="any" class="dark-input" v-model.number="zoneForm.latitude" />
                </div>
                <div class="form-group">
                  <label>Longitude</label>
                  <input type="number" step="any" class="dark-input" v-model.number="zoneForm.longitude" />
                </div>
                <div class="form-group">
                  <label>Irrigation Mode</label>
                  <select class="dark-input" v-model="zoneForm.irrigationMode">
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <p v-if="contractsStore.zoneError" class="error-text">{{ contractsStore.zoneError }}</p>

              <GtxButton
                variant="primary"
                style="width: 100%; margin-top: 0.5rem;"
                :disabled="contractsStore.isSavingZone"
                @click="handleCreateZone"
              >
                {{ contractsStore.isSavingZone ? 'CREATING...' : 'ADD ZONE' }}
              </GtxButton>
            </div>
          </div>
        </div>

        <!-- Members -->
        <div class="form-card members-column">
          <h3 class="section-title">3. Active Members</h3>
          <p class="subtitle">Users currently registered under this association.</p>

          <div class="invite-section">
            <h4 class="admin-title">Invite Member</h4>
            <p class="admin-subtitle">Generate a registration link for a new member.</p>

            <div class="form-group">
              <label>Email</label>
              <input type="email" class="dark-input" v-model="inviteForm.email" placeholder="member@organizacion.com" />
            </div>

            <div class="form-group">
              <label>Role</label>
              <select class="dark-input" v-model="inviteForm.roleId">
                <option :value="4">Basic User</option>
                <option :value="5">Advanced User</option>
              </select>
            </div>

            <p v-if="inviteStore.errorMessage" class="error-text">{{ inviteStore.errorMessage }}</p>

            <GtxButton
              variant="primary"
              style="width: 100%; margin-top: 0.5rem;"
              :disabled="inviteStore.isLoading"
              @click="handleCreateInvite"
            >
              {{ inviteStore.isLoading ? 'GENERATING...' : 'GENERATE INVITE LINK' }}
            </GtxButton>

            <div v-if="generatedMemberLink" class="magic-link-box" style="margin-top: 1rem;">
              <p><strong>Generated Member Link:</strong></p>
              <a :href="generatedMemberLink" target="_blank">{{ generatedMemberLink }}</a>
            </div>
          </div>

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
import { CatalogApi } from '@/modules/catalog/infrastructure/CatalogApi';
import GtxButton from '@/shared/ui/GtxButton.vue';
import { useInviteStore } from '@/modules/profiles/application/useInviteStore';

const inviteStore = useInviteStore();
const route = useRoute();
const router = useRouter();
const contractsStore = useContractsStore();
const profileStore = useProfileStore();

const association = computed(() => contractsStore.currentAssociation);
const farm = computed(() => contractsStore.currentFarm);
const farmZones = computed(() => contractsStore.farmZones);
const isLoadingFarm = ref(false);
const isLoadingZones = computed(() => contractsStore.isLoadingZones);
const crops = ref([]);

const zoneForm = ref({
  name: '',
  cropId: 0,
  latitude: -12.0464,
  longitude: -77.0428,
  irrigationMode: 'AUTOMATIC',
});

const maxZonesAllowed = computed(() => {
  if (!association.value?.hasActiveContract) return null;
  return Number(association.value.maxZones) || 0;
});

const canAddZone = computed(() => {
  if (!farm.value) return false;
  if (maxZonesAllowed.value == null) return true;
  return farmZones.value.length < maxZonesAllowed.value;
});

const zoneLimitLabel = computed(() => {
  if (maxZonesAllowed.value == null) return null;
  return `${farmZones.value.length} / ${maxZonesAllowed.value} zones`;
});

const zoneLimitMessage = computed(() => {
  if (!farm.value) return 'Register a farm before adding zones.';
  if (maxZonesAllowed.value == null) return 'Cannot add zones without a farm.';
  if (farmZones.value.length >= maxZonesAllowed.value) {
    return `Zone limit reached (${maxZonesAllowed.value}). Update the contract to allow more.`;
  }
  return '';
});

const cropLabel = (cropId) => {
  const crop = crops.value.find((c) => String(c.id) === String(cropId));
  return crop?.commonName || `Crop #${cropId}`;
};

const goToZone = (zoneId) => {
  router.push({ name: 'zone-detail', params: { id: route.params.id, zoneId } });
};

const handleCreateZone = async () => {
  const name = zoneForm.value.name.trim();
  if (!name || !zoneForm.value.cropId) {
    alert('Zone name and crop are required.');
    return;
  }

  try {
    await contractsStore.addZone(farm.value.id, {
      name,
      cropId: zoneForm.value.cropId,
      latitude: zoneForm.value.latitude,
      longitude: zoneForm.value.longitude,
      irrigationMode: zoneForm.value.irrigationMode,
    });
    zoneForm.value.name = '';
    zoneForm.value.cropId = 0;
    alert('Zone created successfully.');
  } catch {
    alert(contractsStore.zoneError || 'Failed to create zone.');
  }
};
const associatedUsers = ref([]);
const isLoadingUsers = ref(false);
const generatedContractLink = ref('');
const generatedMemberLink = ref('');
const inviteForm = ref({ email: '', roleId: 4 });

const handleCreateInvite = async () => {
  if (!inviteForm.value.email) {
    inviteStore.errorMessage = 'Email is required.';
    return;
  }
  try {
    const result = await inviteStore.createInvite(
      Number(route.params.id),
      inviteForm.value.email,
      inviteForm.value.roleId
    );
    generatedMemberLink.value = `${window.location.origin}/register?email=${inviteForm.value.email}&token=${result.token}`;
    inviteForm.value.email = '';
  } catch {
    // el error ya está en inviteStore.errorMessage
  }
};

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

const reloadAssociationState = async () => {
  const id = route.params.id;
  await contractsStore.refreshAssociationById(id);
  syncFormWithContract();
  if (contractsStore.currentFarm?.id) {
    await contractsStore.loadZonesForFarm(contractsStore.currentFarm.id);
  }
};

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
      await reloadAssociationState();
      alert(isCanceled.value ? 'Contract reactivated!' : 'Contract updated!');
    } catch { alert('Action failed.'); }
  } else {
    await handleCreateContract();
  }
};

const handleDelete = async () => {
  if (!confirm('Are you sure you want to TERMINATE this contract?')) return;
  try {
    await contractsStore.deleteContract(association.value.contractId);
    await reloadAssociationState();
    alert('Contract has been deactivated and suspended.');
  } catch { alert('Error deactivating contract.'); }
};

const handleCreateContract = async () => {
  if (!contractForm.value.orgAdminEmail) { alert('Admin email is required.'); return; }
  try {
    const payload = { ...contractForm.value, associationId: Number(association.value.id) };
    if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
    if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
    const response = await contractsStore.addContract(payload);
    await reloadAssociationState();
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

  try {
    crops.value = await CatalogApi.getCrops();
  } catch (err) {
    console.error('Failed to load crops', err);
  }

  isLoadingFarm.value = true;
  try {
    const loadedFarm = await contractsStore.loadFarmForAssociation(id);
    if (loadedFarm?.id) {
      await contractsStore.loadZonesForFarm(loadedFarm.id);
    }
  } finally {
    isLoadingFarm.value = false;
  }
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

.farm-banner {
  background-color: #161819;
  border: 1px solid #2a2e30;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}

.farm-banner.farm-missing {
  color: #9ca3af;
}

.farm-label {
  display: block;
  color: var(--emerald-green);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.farm-name {
  color: white;
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}

.farm-location {
  color: #9ca3af;
  margin: 0;
}

.zones-section {
  margin-top: 0;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.members-column .users-list {
  margin-top: 1.5rem;
}

.zones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.zone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: #1f2325;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.zone-item-clickable {
  cursor: pointer;
  transition: background-color 0.15s;
}

.zone-item-clickable:hover {
  background-color: #2a2f32;
}

.zone-name {
  color: white;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.zone-meta,
.zone-coords {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0;
}

.zone-id {
  color: var(--emerald-green);
  font-weight: 600;
  white-space: nowrap;
}

.empty-zones,
.zone-limit-msg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.zone-form {
  border-top: 1px solid #2a2e30;
  padding-top: 1.25rem;
}

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

  .dashboard-column {
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