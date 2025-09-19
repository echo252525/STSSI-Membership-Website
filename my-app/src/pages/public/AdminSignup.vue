<template>
  <div class="auth-wrap d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-sm rounded-4 bg-white p-4 p-md-5">
      <h3 class="fw-bold mb-4 text-center">Admin Signup</h3>

      <form @submit.prevent="handleSignup" novalidate>
        <div class="mb-3">
          <label for="fullName" class="form-label">Full Name</label>
          <input v-model.trim="fullName" type="text" class="form-control" id="fullName" required />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model.trim="email" type="email" class="form-control" id="email" required />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" required />
        </div>

        <div class="mb-3">
          <label for="number" class="form-label">Contact Number</label>
          <input v-model.trim="number" type="tel" class="form-control" id="number" placeholder="e.g. 0917 123 4567" />
        </div>

        <div class="mb-3">
          <label for="address" class="form-label">Address</label>
          <input v-model.trim="address" type="text" class="form-control" id="address" />
        </div>

        <div class="mb-4">
          <label for="age" class="form-label">Age</label>
          <input v-model.number="age" type="number" min="0" class="form-control" id="age" />
        </div>

        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loading ? 'Creating account…' : 'Sign up' }}
        </button>
      </form>

      <p class="text-center small mt-3 mb-0">
        Already have an account?
        <router-link :to="{ name: 'admin.login' }">Log in here</router-link>
      </p>

      <p v-if="notice" class="text-center small text-muted mt-3 mb-0">{{ notice }}</p>
      <p v-if="errorMsg" class="text-center small text-danger mt-2 mb-0">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';

const router = useRouter();

const fullName = ref('');
const email = ref('');
const password = ref('');
const number = ref('');
const address = ref('');
const age = ref<number | null>(null);

const loading = ref(false);
const notice = ref('');
const errorMsg = ref('');

// ⬇️ pass the Auth UID so admins.id == auth.users.id
async function insertAdminRow(userId: string) {
  const payload: any = {
    id: userId, // ✅ use auth uid as PK
    email: email.value,
    full_name: fullName.value,
    number: number.value || null,
    address: address.value || null,
    age: age.value ?? null,
  };

  const { error } = await supabase.from('admins').insert([payload]);
  if (error) {
    if ((error as any).code === '23505') {
      throw new Error('An admin with this email already exists.');
    }
    throw error;
  }
}

const handleSignup = async () => {
  loading.value = true;
  notice.value = '';
  errorMsg.value = '';

  try {
    // 1) Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
          number: number.value,
          address: address.value,
          age: age.value,
        },
        // emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });
    if (error) throw error;

    const userId = data?.user?.id;
    if (!userId) throw new Error('Could not obtain newly created user id.');

    // 2) Insert admins row with the same UID
    await insertAdminRow(userId);

    // 3) If session exists, go dashboard; otherwise guide to verify/login
    const session = data?.session ?? null;
    if (session) {
      notice.value = 'Account created! Redirecting…';
      router.push({ name: 'admin.dashboard' });
    } else {
      notice.value =
        'We sent you a confirmation email. Please verify, then log in. Your admin profile has already been created.';
      // router.push({ name: 'admin.login' });
    }
  } catch (err: any) {
    console.error(err);
    errorMsg.value = err?.message ?? 'Something went wrong during signup.';
  } finally {
    loading.value = false;
  }
};
</script>



<style scoped>
.auth-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff1f1, #eef4ff 40%, #f6fff7);
}
.auth-card {
  max-width: 520px;
  width: 100%;
}
</style>
