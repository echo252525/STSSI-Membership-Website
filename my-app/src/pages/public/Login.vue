<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary">
    <div class="card shadow-lg border-0 rounded-4" style="max-width: 520px; width: 100%;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-1">Log in</h2>
          <p class="text-secondary mb-0">Welcome back—let’s get you in</p>
        </div>

        <form @submit.prevent="onSubmit" class="row g-3">
          <div class="col-12">
            <input
              v-model.trim="email"
              type="email"
              class="form-control form-control-lg"
              placeholder="Email"
              required
            />
          </div>

          <div class="col-12">
            <input
              v-model="password"
              type="password"
              class="form-control form-control-lg"
              placeholder="Password"
              required
            />
          </div>

          <div class="col-12 d-grid">
            <button
              :disabled="loading"
              type="submit"
              class="btn btn-primary btn-lg py-2"
            >
              {{ loading ? 'Logging in…' : 'Login' }}
            </button>
          </div>
        </form>

        <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</p>

        <p class="text-center text-secondary mt-4 mb-0">
          No account?
          <router-link :to="{ name: 'signup' }" class="link-primary text-decoration-none">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabaseClient';

const router = useRouter(); const route = useRoute();
const email = ref(''); const password = ref('');
const loading = ref(false); const error = ref('');

const onSubmit = async () => {
  loading.value = true; error.value = '';
  try {
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (signInErr) throw signInErr;

    const redirect = (route.query.redirect as string) || '/app';
    router.push(redirect);
  } catch (e: any) {
    error.value = e?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Optional subtle polish on top of Bootstrap */
.card {
  backdrop-filter: blur(6px);
}
@media (min-width: 768px) {
  .card-body {
    padding: 2.5rem !important;
  }
}
</style>
