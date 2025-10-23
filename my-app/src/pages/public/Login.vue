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
            <h3 class="fw-bold mb-1">Member Login</h3>
            <p class="text-secondary mb-0">Welcome back—let’s get you in</p>
          </div>
        </div>

        <form @submit.prevent="onSubmit" class="row g-3">
          <div class="col-12">
            <label for="email" class="form-label">Email</label>
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              required
            />
          </div>

          <div class="col-12">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                id="password"
                required
              />
              <span
                class="input-group-text bg-white password-toggle"
                role="button"
                @click="togglePassword"
              >
                <span class="material-symbols-outlined">
                  {{ showPassword ? 'visibility' : 'visibility_off' }}
                </span>
              </span>
            </div>

            <!-- ✅ ADDED: Forgot password link (right below Password field) -->
            <div class="d-flex justify-content-end mt-1">
              <router-link
                :to="{ name: 'forgot-password' }"
                class="small text-decoration-none"
              >
                Forgot password?
              </router-link>
            </div>
          </div>

          <div class="d-flex flex-column flex-sm-row gap-2">
            <router-link
              class="btn btn-outline-secondary flex-fill"
              :to="{ name: 'home' }"
            >
              Back
            </router-link>
            <button type="submit" class="btn btn-primary flex-fill" :disabled="loading">
              {{ loading ? 'Logging in…' : 'Login' }}
            </button>
          </div>
          <div class="col-12 d-grid"></div>
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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

//show password
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    // 1) Auth sign-in
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (signInErr) throw signInErr

    // 2) Make sure we got a user id
    const uid = signInData?.user?.id
    if (!uid) {
      // Defensive: sign out if something is odd
      await supabase.auth.signOut()
      throw new Error('Login failed: missing user id.')
    }

    // 3) Check that a corresponding row exists in public.users
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', uid)
      .maybeSingle()

    if (profileErr || !profile) {
      await supabase.auth.signOut()
      throw new Error('Incorrect email or password.')
    }

    // 4) Proceed to app
    const redirect = (route.query.redirect as string) || '/app'
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
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
