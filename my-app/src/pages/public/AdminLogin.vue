<template>
  <div class="auth-wrap d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-sm rounded-4 bg-white p-4 p-md-5 d-flex row align-items-center justify-content-center">
      <button type="button" class="btn-back" aria-label="Back">
        <span class="material-symbols-outlined">keyboard_arrow_left</span>
      </button>
      <img src="../../../public/STSSI_logo.png" class="img-fluid login-logo" alt="STSSI logo" />
      <h3 class="fw-bold mb-4 text-center">Admin Login</h3>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model.trim="email" type="email" class="form-control" id="email" required />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" required />
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          {{ loading ? 'Signing in…' : 'Log in' }}
        </button>
      </form>

      <p v-if="errorMsg" class="text-center small text-danger mt-3 mb-0">{{ errorMsg }}</p>

      <p class="text-center small mt-3 mb-0">
        Don’t have an account?
        <router-link :to="{ name: 'admin.signup' }">Sign up here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true

  try {
    // 1) Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error

    // 2) (Optional but recommended) Ensure this user has an admins row
    //    If you want to strictly allow only admins, keep this check.
    //    If you want everyone to pass, you may remove this block.
    const userId = data.user?.id
    if (!userId) throw new Error('Login succeeded but no user ID was returned.')

    const { data: adminRow, error: adminErr } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single()

    if (adminErr || !adminRow) {
      // Comment-out the next line if you don't want to block non-admins:
      throw new Error('Your account is not registered as an admin.')
    }

    // 3) Redirect to Admin Dashboard (by name)
    await router.push({ name: 'admin.dashboard' })
    // Or by path if that’s how your routes are defined:
    // await router.push('/pages/admin/AdminDashboard');
  } catch (err: any) {
    // Common auth errors to present nicely
    const msg =
      err?.message ||
      err?.error_description ||
      'Unable to sign in. Please check your credentials and try again.'
    errorMsg.value = msg
    console.error('Admin login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root,
:host {
  --green: #20a44c;
  --blue: #30ace4; /* bright blue from the logo family */
  --azure: #20647c; /* deep teal accent */
}
.auth-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #eef4ff, #f7fcff 40%, #f6fff7);
}
.auth-card {
  position: relative;
  max-width: 450px;
  width: 100%;
}

/* back button */
.btn-back{
  position: absolute;
  top: 7%;
  left: 85%;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid gray;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease;
  .material-symbols-outlined {
    color: gray;
  }
}
.btn-back:hover{
  background-color: rgba(32,100,124,.08);  /* still flat, no shadow */
}

/* keep logo proportions */
.login-logo {
  height: 58px; /* pick your size */
  width: auto; /* prevents squish */
  object-fit: contain;
  display: block;
  margin: 1.5rem auto 0.5rem; /* optional: center above heading */
}

@media only screen and (max-width: 431px) {
  .auth-card {
    max-width: 350px;
  }
  .login-logo {
    height: 48px;
  }
}
</style>
