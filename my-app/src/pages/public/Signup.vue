<template>
  <div class="body min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary">
    <div class="card shadow-lg border-0 rounded-4">
      <div class="card-body p-4 p-md-5">
        <div class="mb-4 d-flex align-items-center justify-content-center gap-4">
          <div>
            <img
              src="../../../public/STSSI_logo.png"
              class="img-fluid login-logo"
              alt="STSSI logo"
            />
          </div>
          <div>
            <h3 class="fw-bold mb-1">Member Signup</h3>
            <p class="text-secondary mb-0">Create your account to unlock perks!</p>
          </div>
        </div>

        <form @submit.prevent="onSubmit" class="row g-3">
          <div class="col-12">
            <label for="fullName" class="form-label">Full Name *</label>
            <input
              v-model.trim="fullName"
              type="text"
              class="form-control"
              placeholder="Firstname M.I. Lastname"
              required
            />
          </div>

          <div class="col-12">
            <label for="email" class="form-label">Email *</label>
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div class="password-div d-flex justify-content-between gap-2">
            <div class="position-relative flex-fill">
              <label for="password" class="form-label">Password *</label>
              <div class="input-group">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  required
                />
                <span 
                  class="input-group-text bg-white"
                  role="button"
                  @click="togglePassword"
                >
                  <span
                    class="material-symbols-outlined">
                    {{ showPassword ? 'visibility' : 'visibility_off' }}
                  </span>
                </span>
              </div>
            </div>

            <div class="flex-fill">
              <label for="confirmPassword" class="form-label">Confirm Password *</label>
              <div class="input-group">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  id="confirmPassword"
                  required
                />
                <span 
                  class="input-group-text bg-white"
                  role="button"
                  @click="toggleConfirmPassword"
                >
                  <span
                    class="material-symbols-outlined">
                    {{ showConfirmPassword ? 'visibility' : 'visibility_off' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="col-12">
            <label for="address" class="form-label">Address</label>
            <input
              v-model.trim="address"
              type="text"
              class="form-control"
              placeholder="Street, City, Province, ZIP"
            />
          </div>

          <div class="col-12">
            <label for="age" class="form-label">Age</label>
            <input
              v-model.number="age"
              type="number"
              min="0"
              class="form-control"
            />
          </div>

          <div class="col-12 d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-outline-secondary flex-fill">Back</button>
            <button :disabled="loading" class="btn btn-primary flex-fill" type="submit">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const password = ref('')
const address = ref('')
const age = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

// show password
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
// show confirm password
const showConfirmPassword = ref(false)
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// NOTE: This relies on DB/RLS we set up earlier:
//  - public.users with PK/FK id -> auth.users(id)
//  - RLS enabled
//  - Policy: allow INSERT for role 'anon' (ins_signup_anon) so signup can insert before session exists
//  - email is citext + unique(email)

const onSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // 1) Create auth user (includes metadata)
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { full_name: fullName.value },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (signErr) throw signErr

    const user = data.user
    if (!user?.id) {
      // Extremely rare, but handle defensively
      alert('Sign-up created, but no user ID returned. Please log in.')
      return router.push({ name: 'login' })
    }

    // 2) Insert the profile row immediately after signup.
    //    Works even without a session because of the anon INSERT policy.
    const insertPayload = {
      id: user.id, // must match auth.users.id
      email: email.value, // citext unique
      full_name: fullName.value,
      address: address.value || null,
      age: Number.isFinite(Number(age.value)) ? Number(age.value) : null,
      membership_type: 'regular', // default tier
    }

    const { error: insertErr } = await supabase.from('users').insert([insertPayload])

    // Handle duplicate/edge retries gracefully: ignore unique violation on email/id
    if (insertErr) {
      if (!/duplicate key value|unique constraint/i.test(insertErr.message)) {
        throw insertErr
      }
    }

    const session = data.session ?? null
    alert(
      session ? 'Sign-up successful!' : 'Sign-up successful! Please check your email to confirm.',
    )

    router.push({ name: 'login' })
  } catch (e: any) {
    error.value = e?.message || 'Sign-up failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root,
:host {
  --green: #20a44c;
  --blue: #30ace4;
  --azure: #20647c;
}
.body {
  min-height: 100vh;
  background: linear-gradient(135deg, #a4e7ff, #f7fcff 50%, #afffca);
}
.card {
  max-width: 720px;
  width: 100%;
  backdrop-filter: blur(6px);
}
.login-logo {
  height: 58px;
  width: auto;
}
@media only screen and (max-width: 431px) {
  .password-div {
    flex-direction: column;
  }
  .card {
    max-width: 400px;
  }
  .login-logo {
    height: 38px;
  }
}
</style>
