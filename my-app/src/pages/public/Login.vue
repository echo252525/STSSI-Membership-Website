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
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
              >
                <span class="material-symbols-outlined">
                  {{ showPassword ? 'visibility' : 'visibility_off' }}
                </span>
              </span>
            </div>

            <!-- ✅ Forgot password link (kept as-is) -->
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

        <!-- Kept this line per your request to not remove code. It will remain empty since we show SweetAlert instead. -->
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
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('') // kept, but we won't display errors here—SweetAlert will handle UX

//show password
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

function normalizeErrorMessage(e: unknown): string {
  const msg = (e as any)?.message || ''
  if (/invalid login/i.test(msg)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email before logging in.'
  return msg || 'Login failed. Please try again.'
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

    // 4) Sweet, we’re in — show a friendly success then redirect
    const redirect = (route.query.redirect as string) || '/app'
    await Swal.fire({
      icon: 'success',
      title: 'Welcome back!',
      text: 'Login successful.',
      timer: 1100,
      showConfirmButton: false,
    })

    router.push(redirect)
  } catch (e: any) {
    const message = normalizeErrorMessage(e)
    // show SweetAlert error
    await Swal.fire({
      icon: 'error',
      title: 'Login failed',
      text: message,
      confirmButtonText: 'Try again',
    })
    // keep your original reactive state but don’t surface it in the UI
    error.value = ''
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
.password-toggle {
  cursor: pointer;
  border-left: 0;
}
.password-toggle:hover {
  background: #f6f8fa;
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
