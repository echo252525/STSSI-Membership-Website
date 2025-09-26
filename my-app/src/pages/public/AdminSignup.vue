<template>
  <div class="auth-wrap d-flex align-items-center justify-content-center">
    <div class="auth-card shadow-sm rounded-4 bg-white p-4 p-md-5">
      <div
        class="auth-head d-flex align-items-center justify-content-center gap-3 mb-4 text-center"
      >
        <img src="../../../public/STSSI_logo.png" class="img-fluid login-logo" alt="STSSI logo" />
        <h3 class="fw-bold">Admin Signup</h3>
      </div>

      <form @submit.prevent="handleSignup" novalidate>
        <div class="mb-3">
          <label for="fullName" class="form-label">Full Name</label>
          <input
            v-model.trim="fullName"
            type="text"
            class="form-control"
            placeholder="Firstname M.I. Lastname"
            id="fullName"
            required
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model.trim="email" type="email" class="form-control" id="email" required />
        </div>

        <div class="mb-3 position-relative">
          <label for="password" class="form-label">Password</label>
          <div class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="password"
              required
            />
            <span class="input-group-text bg-white" role="button" @click="togglePassword">
              <span class="material-symbols-outlined">
                {{ showPassword ? 'visibility' : 'visibility_off' }}
              </span>
            </span>
          </div>
        </div>

        <div class="d-flex justify-content-between gap-2">
          <div class="mb-3">
            <label for="number" class="form-label">Phone Number</label>
            <input
              v-model.trim="number"
              type="tel"
              class="form-control"
              id="number"
            />
          </div>

          <div class="mb-3">
            <label for="age" class="form-label">Age</label>
            <input v-model.number="age" type="number" min="0" class="form-control" id="age" />
          </div>
        </div>

        <div class="mb-4">
          <label for="address" class="form-label">Address</label>
          <input
            v-model.trim="address"
            type="text"
            class="form-control"
            id="address"
            placeholder="Street, City, Province, ZIP"
          />
        </div>

        <div class="d-flex flex-column flex-sm-row gap-2">
          <button type="button" href="#" class="btn btn-outline-secondary flex-fill">Back</button>
          <button type="submit" class="btn btn-primary flex-fill" :disabled="loading">
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ loading ? 'Creating account…' : 'Sign up' }}
          </button>
        </div>
      </form>

      <p class="text-center small mt-3 mb-0">
        Already have an account?
        <router-link
          class="link-offset-2 link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
          :to="{ name: 'admin.login' }"
          >Log in here</router-link
        >
      </p>

      <p v-if="notice" class="text-center small text-muted mt-3 mb-0">{{ notice }}</p>
      <p v-if="errorMsg" class="text-center small text-danger mt-2 mb-0">{{ errorMsg }}</p>
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
const number = ref('')
const address = ref('')
const age = ref<number | null>(null)

const loading = ref(false)
const notice = ref('')
const errorMsg = ref('')

// show password
const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// ⬇️ pass the Auth UID so admins.id == auth.users.id
async function insertAdminRow(userId: string) {
  const payload: any = {
    id: userId, // ✅ use auth uid as PK
    email: email.value,
    full_name: fullName.value,
    number: number.value || null,
    address: address.value || null,
    age: age.value ?? null,
  }

  const { error } = await supabase.from('admins').insert([payload])
  if (error) {
    if ((error as any).code === '23505') {
      throw new Error('An admin with this email already exists.')
    }
    throw error
  }
}

const handleSignup = async () => {
  loading.value = true
  notice.value = ''
  errorMsg.value = ''

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
    })
    if (error) throw error

    const userId = data?.user?.id
    if (!userId) throw new Error('Could not obtain newly created user id.')

    // 2) Insert admins row with the same UID
    await insertAdminRow(userId)

    // 3) If session exists, go dashboard; otherwise guide to verify/login
    const session = data?.session ?? null
    if (session) {
      notice.value = 'Account created! Redirecting…'
      router.push({ name: 'admin.dashboard' })
    } else {
      notice.value =
        'We sent you a confirmation email. Please verify, then log in. Your admin profile has already been created.'
      // router.push({ name: 'admin.login' });
    }
  } catch (err: any) {
    console.error(err)
    errorMsg.value = err?.message ?? 'Something went wrong during signup.'
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
.auth-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #afffca, #f7fcff 50%, #a4e7ff);
}
.auth-card {
  max-width: 520px;
  width: 100%;
}

/* logo */
.auth-head {
  flex-wrap: wrap;
} /* lets them stack on very small screens */
.login-logo {
  height: 38px;
  width: auto;
} /* tidy size beside the text */

@media only screen and (max-width: 431px) {
  .auth-card {
    max-width: 350px;
  }
  .login-logo {
    height: 38px;
  }
}
</style>
