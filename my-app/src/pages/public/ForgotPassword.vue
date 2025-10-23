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
            <h3 class="fw-bold mb-1">
              {{ isRecovery ? 'Set New Password' : 'Forgot Password' }}
            </h3>
            <p class="text-secondary mb-0">
              {{ isRecovery ? 'Enter a new password for your account' : 'We’ll send you a reset link' }}
            </p>
          </div>
        </div>

        <!-- Request reset link -->
        <form v-if="!isRecovery" @submit.prevent="sendReset" class="row g-3">
          <div class="col-12">
            <label class="form-label">Email</label>
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <button class="btn btn-primary w-100" type="submit" :disabled="loading">
            {{ loading ? 'Sending…' : 'Send Reset Link' }}
          </button>

          <router-link :to="{ name: 'login' }" class="btn btn-outline-secondary w-100">
            Back to Login
          </router-link>
        </form>

        <!-- Set new password (after clicking email link) -->
        <form v-else @submit.prevent="updatePwd" class="row g-3">
          <div class="col-12">
            <label class="form-label">New Password</label>
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              class="form-control"
              minlength="6"
              required
            />
            <div class="form-text">Minimum 6 characters.</div>
          </div>

          <div class="col-12">
            <label class="form-label">Confirm Password</label>
            <div class="input-group">
              <input
                v-model="confirmPassword"
                :type="showNew ? 'text' : 'password'"
                class="form-control"
                minlength="6"
                required
              />
              <button
                type="button"
                class="input-group-text bg-white"
                @click="showNew = !showNew"
                aria-label="Toggle password visibility"
              >
                <span class="material-symbols-outlined">
                  {{ showNew ? 'visibility' : 'visibility_off' }}
                </span>
              </button>
            </div>
          </div>

          <button class="btn btn-primary w-100" type="submit" :disabled="loading">
            {{ loading ? 'Updating…' : 'Update Password' }}
          </button>

          <router-link :to="{ name: 'login' }" class="btn btn-outline-secondary w-100">
            Back to Login
          </router-link>
        </form>

        <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</p>
        <p v-if="success" class="alert alert-success mt-3 mb-0" role="alert">{{ success }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref('')
const isRecovery = ref(false)

// Request reset link
const email = ref('')

// Update password (recovery)
const newPassword = ref('')
const confirmPassword = ref('')
const showNew = ref(false)

onMounted(() => {
  // Detect Supabase recovery mode if user clicked the email link
  // Supabase appends tokens in the URL hash: #access_token=...&type=recovery
  const hash = route.hash || window.location.hash || ''
  if (hash.includes('type=recovery')) {
    isRecovery.value = true
  }
})

const sendReset = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const redirectTo = `${window.location.origin}/forgot-password`
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo,
    })
    if (resetErr) throw resetErr
    success.value = 'Reset link sent! Please check your email.'
  } catch (e: any) {
    error.value = e?.message || 'Failed to send reset link.'
  } finally {
    loading.value = false
  }
}

const updatePwd = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    if (newPassword.value !== confirmPassword.value) {
      throw new Error('Passwords do not match.')
    }
    const { error: updErr } = await supabase.auth.updateUser({
      password: newPassword.value,
    })
    if (updErr) throw updErr
    success.value = 'Password updated successfully. Redirecting to login…'
    setTimeout(() => router.push({ name: 'login' }), 1200)
  } catch (e: any) {
    error.value = e?.message || 'Failed to update password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.body {
  min-height: 100vh;
  background: linear-gradient(135deg, #a4e7ff, #f7fcff 50%, #afffca);
}
.card {
  max-width: 520px;
  width: 100%;
  backdrop-filter: blur(6px);
}
.login-logo {
  height: 58px;
  width: auto;
}
@media only screen and (max-width: 431px) {
  .card {
    max-width: 400px;
  }
  .login-logo {
    height: 38px;
  }
}
</style>
