<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary">
    <div class="card shadow-lg border-0 rounded-4" style="max-width: 520px; width: 100%;">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-1">Create account</h2>
          <p class="text-secondary mb-0">Join our membership to unlock perks</p>
        </div>

        <form @submit.prevent="onSubmit" class="row g-3">
          <div class="col-12">
            <input
              v-model.trim="fullName"
              type="text"
              class="form-control form-control-lg"
              placeholder="Full name"
              required
            />
          </div>

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

          <div class="col-12">
            <input
              v-model.trim="address"
              type="text"
              class="form-control form-control-lg"
              placeholder="Address (optional)"
            />
          </div>

          <div class="col-12">
            <input
              v-model.number="age"
              type="number"
              min="0"
              class="form-control form-control-lg"
              placeholder="Age (optional)"
            />
          </div>

          <div class="col-12 d-grid">
            <button
              :disabled="loading"
              class="btn btn-success btn-lg py-2"
              type="submit"
            >
              {{ loading ? 'Signing up…' : 'Sign Up' }}
            </button>
          </div>
        </form>

        <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</p>

        <p class="text-center text-secondary mt-4 mb-0">
          Have an account?
          <router-link :to="{ name: 'login' }" class="link-primary text-decoration-none">
            Log in
          </router-link>
        </p>
      </div>
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
const address = ref('');
const age = ref<number | null>(null);
const loading = ref(false);
const error = ref('');

// NOTE: This relies on DB/RLS we set up earlier:
//  - public.users with PK/FK id -> auth.users(id)
//  - RLS enabled
//  - Policy: allow INSERT for role 'anon' (ins_signup_anon) so signup can insert before session exists
//  - email is citext + unique(email)

const onSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    // 1) Create auth user (includes metadata)
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { full_name: fullName.value },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    });
    if (signErr) throw signErr;

    const user = data.user;
    if (!user?.id) {
      // Extremely rare, but handle defensively
      alert('Sign-up created, but no user ID returned. Please log in.');
      return router.push({ name: 'login' });
    }

    // 2) Insert the profile row immediately after signup.
    //    Works even without a session because of the anon INSERT policy.
    const insertPayload = {
      id: user.id,                             // must match auth.users.id
      email: email.value,                      // citext unique
      full_name: fullName.value,
      address: address.value || null,
      age: Number.isFinite(Number(age.value)) ? Number(age.value) : null,
      membership_type: 'regular',              // default tier
    };

    const { error: insertErr } = await supabase
      .from('users')
      .insert([insertPayload]);

    // Handle duplicate/edge retries gracefully: ignore unique violation on email/id
    if (insertErr) {
      if (!/duplicate key value|unique constraint/i.test(insertErr.message)) {
        throw insertErr;
      }
    }

    const session = data.session ?? null;
    alert(
      session
        ? 'Sign-up successful!'
        : 'Sign-up successful! Please check your email to confirm.'
    );

    router.push({ name: 'login' });
  } catch (e: any) {
    error.value = e?.message || 'Sign-up failed';
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
