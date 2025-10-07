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

          <!-- 🔹 Added: Phone Number -->
          <div class="col-12">
            <label for="phone" class="form-label">Phone Number</label>
            <input
              v-model.trim="phone"
              type="tel"
              class="form-control"
              placeholder="e.g., 09XXXXXXXXX or +63 9XXXXXXXXX"
              id="phone"
              inputmode="tel"
              autocomplete="tel"
            />
            <div class="form-text">We’ll use this for delivery and support updates.</div>
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

          <!-- 🔹 Detailed Address Fields (new) -->
          <div class="col-12">
            <label class="form-label">House/Unit & Street *</label>
            <input
              v-model.trim="addrLine1"
              type="text"
              class="form-control"
              placeholder="e.g., Unit 2B, 123 Sampaguita St."
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label">Barangay <span class="text-muted">(optional)</span></label>
            <input
              v-model.trim="addrLine2"
              type="text"
              class="form-control"
              placeholder="e.g., Brgy. Malinis"
            />
          </div>

          <div class="col-md-6">
            <label class="form-label">City / Municipality *</label>
            <input
              v-model.trim="addrCity"
              type="text"
              class="form-control"
              placeholder="e.g., Quezon City"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Province *</label>
            <input
              v-model.trim="addrProvince"
              type="text"
              class="form-control"
              placeholder="e.g., Metro Manila"
              required
            />
          </div>

          <div class="col-md-2">
            <label class="form-label">ZIP *</label>
            <input
              v-model.trim="addrZip"
              type="text"
              class="form-control"
              placeholder="e.g., 1100"
              required
              pattern="\d{4}"
              title="Enter a valid postal code"
            />
          </div>

          <!-- 🔹 Your original Address field (kept, now auto-filled & read-only) -->
          <div class="col-12">
            <label for="address" class="form-label">Address (Auto-filled)</label>
            <input
              v-model.trim="address"
              type="text"
              class="form-control"
              placeholder="Street, City, Province, ZIP"
              readonly
            />
            <div class="form-text">
              This field is generated from the address details above.
            </div>
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
            <router-link
              class="btn btn-outline-secondary flex-fill"
              :to="{ name: 'home' }"
            >
              Back
            </router-link>
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
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const route = useRoute()

const fullName = ref('')
const email = ref('')
const password = ref('')
const address = ref('') // 🔸 kept from your original code (now auto-computed)
const age = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

// 🔹 Added: phone number state
const phone = ref('')

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

/* 🔹 NEW: Detailed address refs */
const addrLine1 = ref('')     // House/Unit & Street (required)
const addrLine2 = ref('')     // Barangay (optional)
const addrCity = ref('')      // required
const addrProvince = ref('')  // required
const addrZip = ref('')       // required

/* Build a single-line address string for DB storage */
const fullAddress = computed(() => {
  const parts = [
    addrLine1.value,
    addrLine2.value,
    addrCity.value,
    addrProvince.value,
    addrZip.value,
  ].filter(Boolean)
  return parts.join(', ')
})

/* Keep your original address field in sync (read-only) */
watch([addrLine1, addrLine2, addrCity, addrProvince, addrZip], () => {
  address.value = fullAddress.value
})

/* Simple completeness guard for required address parts */
function isAddressComplete() {
  return !!(addrLine1.value && addrCity.value && addrProvince.value && addrZip.value)
}

/* 🔹 Capture referral code from URL (?ref=CODE) */
const referralCode = ref<string | null>(null)
onMounted(() => {
  // try vue-router first
  const qRef = route.query?.ref
  let code: string | null = null
  if (typeof qRef === 'string') code = qRef
  else if (Array.isArray(qRef) && qRef.length > 0) code = qRef[0]
  // fallback to window.location just in case
  if (!code) {
    const fromSearch = new URLSearchParams(window.location.search).get('ref')
    code = fromSearch
  }
  referralCode.value = code ? code.trim() : null
})

// NOTE: This relies on DB/RLS we set up earlier:
//  - public.users with PK/FK id -> auth.users(id)
//  - RLS enabled
//  - Policy: allow INSERT for role 'anon' (ins_signup_anon) so signup can insert before session exists
//  - email is citext + unique(email)
//  - users has columns: referral_code (text/unique?), referred_by (uuid nullable)

const onSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    if (!isAddressComplete()) {
      loading.value = false
      return (error.value = 'Please complete your address (House/Unit & Street, City/Municipality, Province, ZIP).')
    }

    // 1) Create auth user (includes metadata)
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { full_name: fullName.value }, // keeping your original metadata
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (signErr) throw signErr

    const user = data.user
    if (!user?.id) {
      alert('Sign-up created, but no user ID returned. Please log in.')
      return router.push({ name: 'login' })
    }

    // 🔹 1.5) If there is a referral code in URL, find the matching user by users.referral_code
    let referredById: string | null = null
    if (referralCode.value) {
      const { data: refUser, error: refErr } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode.value)
        .maybeSingle()

      // PGRST116 is "No rows found for single() / maybeSingle()", treat as no match
      if (refErr && refErr.code !== 'PGRST116') {
        // For other unexpected errors, throw:
        throw refErr
      }
      referredById = refUser?.id ?? null
    }

    // 2) Insert the profile row immediately after signup.
    //    Works even without a session because of the anon INSERT policy.
    const insertPayload: Record<string, any> = {
      id: user.id, // must match auth.users.id
      email: email.value, // citext unique
      full_name: fullName.value,
      address: fullAddress.value || null, // 🔹 store the assembled address
      age: Number.isFinite(Number(age.value)) ? Number(age.value) : null,
      phone_number: phone.value || null, // 🔹 NEW: store phone number
    }

    // 🔹 Add referred_by only if we found a valid referrer
    if (referredById) {
      insertPayload.referred_by = referredById
    }

    const { error: insertErr } = await supabase.from('users').insert([insertPayload])

    // Handle duplicate/edge retries gracefully: ignore unique violation on email/id
    if (insertErr) {
      if (!/duplicate key value|unique constraint/i.test(insertErr.message)) {
        throw insertErr
      }
    }

    /* 🔹 NEW: Also write to public.referrals if a referrer was resolved
       Schema:
       - referrer_id uuid not null (FK -> users.id)
       - referee_id  uuid not null (FK -> users.id)
       - PK (referrer_id, referee_id), no_self_referral constraint
       - trigger trg_reward_on_referral AFTER INSERT executes reward_on_referral()
       RLS: ensure anon/appropriate role can INSERT or handle via edge func if locked down.
    */
    if (referredById) {
      const { error: refLinkErr } = await supabase
        .from('referrals')
        .insert([{ referrer_id: referredById, referee_id: user.id }])

      // Ignore duplicates (in case of replays) but surface unexpected errors
      if (refLinkErr) {
        if (!/duplicate key value|unique constraint/i.test(refLinkErr.message)) {
          // Non-fatal: do not block signup flow; you can optionally log this
          console.warn('Referral insert failed:', refLinkErr)
        }
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
