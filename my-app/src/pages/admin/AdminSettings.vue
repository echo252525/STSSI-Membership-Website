<template>
  <div class="container-fluid py-3">
    <h3 class="fw-bold mb-4">Admin Settings</h3>

    <div class="row g-4">
      <!-- Profile -->
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-3">Profile</h5>

            <form @submit.prevent="saveProfile" novalidate>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input v-model.trim="fullName" type="text" class="form-control" required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input :value="email" type="email" class="form-control" disabled />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Contact Number</label>
                  <input v-model.trim="number" type="tel" class="form-control" placeholder="e.g. 0917 123 4567" />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Age</label>
                  <input v-model.number="age" min="0" type="number" class="form-control" />
                </div>

                <div class="col-12">
                  <label class="form-label">Address</label>
                  <input v-model.trim="address" type="text" class="form-control" />
                </div>
              </div>

              <div class="d-flex align-items-center gap-2 mt-4">
                <button class="btn btn-primary" type="submit" :disabled="savingProfile">
                  <span v-if="savingProfile" class="spinner-border spinner-border-sm me-2"></span>
                  Save changes
                </button>
                <small v-if="profileNotice" class="text-muted">{{ profileNotice }}</small>
                <small v-if="profileError" class="text-danger">{{ profileError }}</small>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Password -->
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-3">Change Password</h5>

            <form @submit.prevent="changePassword" novalidate>
              <div class="mb-3">
                <label class="form-label">New Password</label>
                <input v-model="newPassword" type="password" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm New Password</label>
                <input v-model="confirmPassword" type="password" class="form-control" required />
              </div>

              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-primary" type="submit" :disabled="changingPassword">
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  Update password
                </button>
                <small v-if="passwordNotice" class="text-muted">{{ passwordNotice }}</small>
                <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>
              </div>
            </form>

            <p class="small text-muted mt-3 mb-0">
              Note: For security, some orgs require recent sign-in to change sensitive info.
            </p>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="col-12">
        <div class="card shadow-sm border-0 danger-card">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-2 text-danger">Danger Zone</h5>
            <p class="small text-muted mb-3">
              Deleting your account is <span class="text-danger fw-semibold">permanent</span> and cannot be undone.
              This will remove your admin profile and revoke access.
            </p>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-danger" @click="openDeleteModal" :disabled="deletingAccount">
                <span v-if="deletingAccount" class="spinner-border spinner-border-sm me-2"></span>
                Delete account
              </button>
              <small v-if="deleteNotice" class="text-muted">{{ deleteNotice }}</small>
              <small v-if="deleteError" class="text-danger">{{ deleteError }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop-simple">
      <div class="modal-dialog-simple">
        <div class="modal-content-simple p-4">
          <h5 class="fw-semibold mb-2">Confirm account deletion</h5>
          <p class="small text-muted">
            This will permanently delete your account. To confirm, type
            <strong>DELETE</strong> below.
          </p>
          <input
            v-model.trim="deleteConfirmText"
            class="form-control mb-3"
            placeholder="Type DELETE to confirm"
            :disabled="deletingAccount"
          />
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="closeDeleteModal" :disabled="deletingAccount">Cancel</button>
            <button
              class="btn btn-danger"
              @click="deleteAccount"
              :disabled="deleteConfirmText !== 'DELETE' || deletingAccount"
            >
              <span v-if="deletingAccount" class="spinner-border spinner-border-sm me-2"></span>
              Permanently delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Confirm Delete Modal -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';
import { currentUser } from '@/lib/authState'

const routers = useRouter()
const user = computed(() => currentUser.value)

onMounted(async () => {
  if (!user.value) {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return routers.push({ name: 'login' })
  }
})
const router = useRouter();

// profile state
const email = ref('');
const fullName = ref('');
const number = ref('');
const address = ref('');
const age = ref<number | null>(null);

// notices
const savingProfile = ref(false);
const profileNotice = ref('');
const profileError = ref('');

// password state
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const passwordNotice = ref('');
const passwordError = ref('');

// delete account state
const deletingAccount = ref(false);
const deleteNotice = ref('');
const deleteError = ref('');
const showDeleteModal = ref(false);
const deleteConfirmText = ref('');

let userId: string | null = null;

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    router.push({ name: 'admin.login' });
    return;
  }

  userId = user.id;
  email.value = user.email || '';
  fullName.value = (user.user_metadata?.full_name as string) || '';

  // fetch profile from admins
  const { data: row } = await supabase
    .from('admins')
    .select('full_name, number, address, age')
    .eq('id', userId)
    .single();

  if (row) {
    fullName.value = row.full_name ?? fullName.value;
    number.value = row.number ?? '';
    address.value = row.address ?? '';
    age.value = row.age ?? null;
  }
});

const saveProfile = async () => {
  profileNotice.value = '';
  profileError.value = '';
  savingProfile.value = true;

  try {
    if (!userId) throw new Error('No authenticated user.');

    // 1) Update admins row
    const payload: any = {
      full_name: fullName.value,
      number: number.value || null,
      address: address.value || null,
      age: age.value ?? null,
    };

    const { error: upErr } = await supabase
      .from('admins')
      .update(payload)
      .eq('id', userId);

    if (upErr) throw upErr;

    // 2) Sync Auth metadata
    const { error: metaErr } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.value,
        number: number.value || null,
        address: address.value || null,
        age: age.value ?? null,
      },
    });
    if (metaErr) throw metaErr;

    profileNotice.value = 'Profile saved.';
  } catch (e: any) {
    profileError.value = e?.message ?? 'Unable to save profile.';
  } finally {
    savingProfile.value = false;
  }
};

const changePassword = async () => {
  passwordNotice.value = '';
  passwordError.value = '';

  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Please fill both password fields.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.';
    return;
  }

  changingPassword.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value });
    if (error) throw error;

    passwordNotice.value = 'Password updated.';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (e: any) {
    passwordError.value = e?.message ?? 'Unable to update password.';
  } finally {
    changingPassword.value = false;
  }
};

// ===== Delete Account (Edge Function: delete-account-user) =====
const openDeleteModal = () => {
  deleteNotice.value = '';
  deleteError.value = '';
  deleteConfirmText.value = '';
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (!deletingAccount.value) showDeleteModal.value = false;
};

const deleteAccount = async () => {
  deleteNotice.value = '';
  deleteError.value = '';
  deletingAccount.value = true;

  try {
    if (!userId) throw new Error('No authenticated user.');

    // Invoke your Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('delete-account-user', {
      body: { user_id: userId },
    });
    if (error) throw error;

    // Sign out locally after deletion
    await supabase.auth.signOut();

    deleteNotice.value = 'Account deleted. Redirecting…';
    showDeleteModal.value = false;

    // Redirect to login (adjust route name if needed)
    setTimeout(() => {
      router.push({ name: 'login' }).catch(() => {});
    }, 900);
  } catch (e: any) {
    deleteError.value = e?.message ?? 'Unable to delete account.';
  } finally {
    deletingAccount.value = false;
  }
};
</script>

<style scoped>
.container-fluid {
  max-width: 1100px;
}
.card {
  border-radius: 14px;
}

/* Danger Zone card subtle red border */
.danger-card {
  border: 1px solid rgba(220, 53, 69, 0.2);
}

/* Lightweight modal without Bootstrap JS */
.modal-backdrop-simple {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-simple {
  width: 100%;
  max-width: 520px;
}
.modal-content-simple {
  background: var(--bs-body-bg);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
</style>
