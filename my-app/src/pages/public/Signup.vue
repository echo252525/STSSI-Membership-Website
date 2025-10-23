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
          <!-- Basic -->
          <div class="col-12">
            <label class="form-label">First Name *</label>
            <input v-model.trim="firstName" type="text" class="form-control" placeholder="Firstname" required />
          </div>

          <div class="col-12">
            <label class="form-label">Last Name *</label>
            <input v-model.trim="lastName" type="text" class="form-control" placeholder="Lastname" required />
          </div>

          <div class="col-12">
            <label for="email" class="form-label">Email *</label>
            <input v-model.trim="email" type="email" class="form-control" required />
          </div>

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
                <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" required />
                <span class="input-group-text bg-white" role="button" @click="togglePassword">
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
                </span>
              </div>
            </div>

            <div class="flex-fill">
              <label for="confirmPassword" class="form-label">Confirm Password *</label>
              <div class="input-group">
                <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword" required />
                <span class="input-group-text bg-white" role="button" @click="toggleConfirmPassword">
                  <span class="material-symbols-outlined">{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Address (PH order without province) -->
          <!-- Region -->
          <div class="col-md-6 position-relative">
            <label class="form-label">Region *</label>
            <input
              v-model.trim="addrRegion"
              type="text"
              class="form-control"
              placeholder="Type to search region…"
              required
              @focus="showRegionSuggest = true"
              @input="onRegionInput"
            />
            <div v-if="showRegionSuggest && filteredRegions.length" class="typeahead-menu list-group shadow position-absolute w-100">
              <button
                v-for="r in filteredRegions"
                :key="r.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickRegion(r)"
              >
                {{ r.name }}
              </button>
            </div>
            <div class="form-text">Source: <a href="https://psgc.cloud/" target="_blank" rel="noopener">PSGC Cloud</a></div>
          </div>

          <!-- City / Municipality -->
          <div class="col-md-6 position-relative">
            <label class="form-label">City / Municipality *</label>
            <input
              v-model.trim="addrCity"
              type="text"
              class="form-control"
              placeholder="Type to search (e.g., Quezon City)"
              required
              @focus="showCitySuggest = true"
              @input="onCityInput"
            />
            <div v-if="showCitySuggest && filteredLGUs.length" class="typeahead-menu list-group shadow position-absolute w-100">
              <button
                v-for="l in filteredLGUs"
                :key="l.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickLGU(l)"
              >
                {{ l.name }} <span class="text-muted">• {{ l.isCity ? 'City' : 'Municipality' }}</span>
                <span v-if="regionNameForLGU(l)" class="text-muted"> — {{ regionNameForLGU(l) }}</span>
              </button>
            </div>
            <div class="form-text">Source: <a href="https://psgc.cloud/" target="_blank" rel="noopener">PSGC Cloud</a></div>
          </div>

          <!-- Barangay -->
          <div class="col-md-6 position-relative">
            <label class="form-label">Barangay <span class="text-muted">(optional)</span></label>
            <input
              v-model.trim="addrLine2"
              type="text"
              class="form-control"
              placeholder="Type to search barangay…"
              @focus="showBarangaySuggest = true"
              @input="onBarangayInput"
            />
            <div v-if="showBarangaySuggest && filteredBarangays.length" class="typeahead-menu list-group shadow position-absolute w-100">
              <button
                v-for="b in filteredBarangays"
                :key="b.code"
                type="button"
                class="list-group-item list-group-item-action"
                @mousedown.prevent="pickBarangay(b)"
              >
                {{ b.name }}
              </button>
            </div>
            <div class="form-text">Source: <a href="https://psgc.cloud/" target="_blank" rel="noopener">PSGC Cloud</a></div>
          </div>

          <!-- ZIP -->
          <div class="col-md-3">
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

          <!-- Detailed Address (House/Street) -->
          <div class="col-md-9">
            <label class="form-label">House/Unit & Street *</label>
            <input
              v-model.trim="addrLine1"
              type="text"
              class="form-control"
              placeholder="e.g., Unit 2B, 123 Sampaguita St."
              required
            />
          </div>

          <!-- (Removed) Landmark / Extra details per request -->
          <!-- (Removed) Address (Auto-filled) display per request -->

          <div class="col-12">
            <label for="age" class="form-label">Age *</label>
            <input v-model.number="age" type="number" min="18" class="form-control" required />
            <div class="form-text">You must be 18 or older to sign up.</div>
          </div>

          <div class="col-12 d-flex flex-column flex-sm-row gap-2">
            <router-link class="btn btn-outline-secondary flex-fill" :to="{ name: 'home' }">Back</router-link>
            <button :disabled="loading" class="btn btn-primary flex-fill" type="submit">
              {{ loading ? 'Signing up…' : 'Sign Up' }}
            </button>
          </div>
        </form>

        <p v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">{{ error }}</p>

        <p class="text-center text-secondary mt-4 mb-0">
          Have an account?
          <router-link :to="{ name: 'login' }" class="link-primary text-decoration-none">Log in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()
const route = useRoute()

/* Name split */
const firstName = ref('')
const lastName = ref('')

const email = ref('')
const password = ref('')
const address = ref('') // single-line auto (hidden in UI but used for DB)
const age = ref<number | null>(null)
const loading = ref(false)
const error = ref('')
const phone = ref('')

// show password toggles
const showPassword = ref(false)
const togglePassword = () => (showPassword.value = !showPassword.value)
const showConfirmPassword = ref(false)
const toggleConfirmPassword = () => (showConfirmPassword.value = !showConfirmPassword.value)

/* Address state (PH order without province) */
const addrRegion = ref('')     // Region (required)
const addrCity = ref('')       // City/Municipality (required)
const addrLine2 = ref('')      // Barangay (optional)
const addrZip = ref('')        // ZIP (required)
const addrLine1 = ref('')      // House/Street (required)

/* PSGC types */
type Region = { code: string; name: string }
type Province = { code: string; name: string; regionCode: string }
type LGU = { code: string; name: string; isCity: boolean; provinceCode: string }
type Barangay = { code: string; name: string }

/* Datasets */
const regions = ref<Region[]>([])
const provinces = ref<Province[]>([])        // used ONLY to derive region from city; not shown to users
const lguAll = ref<LGU[]>([])               // all cities/municipalities
const lguScoped = ref<LGU[]>([])            // LGUs filtered by region
const barangays = ref<Barangay[]>([])

/* Lookups */
const regionNameByCode: Record<string, string> = {}
const provinceByCode: Record<string, Province> = {}

/* Typeahead visibility */
const showRegionSuggest = ref(false)
const showCitySuggest = ref(false)
const showBarangaySuggest = ref(false)

/* Close menus when clicking outside */
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.position-relative')) {
    showRegionSuggest.value = false
    showCitySuggest.value = false
    showBarangaySuggest.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick, { capture: true }))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, { capture: true }))

/* Fetch helper */
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json() as Promise<T>
}

/* Loads */
async function loadRegions() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/regions')
  regions.value = data.map(r => ({ code: r.code, name: r.regionName || r.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  regions.value.forEach(r => (regionNameByCode[r.code] = r.name))
}

async function loadProvinces() {
  const data = await fetchJSON<any[]>('https://psgc.cloud/api/provinces')
  provinces.value = data
    .map(p => ({ code: p.code, name: p.name, regionCode: p.region_code || p.regionCode }))
    .sort((a, b) => a.name.localeCompare(b.name))
  provinces.value.forEach(p => (provinceByCode[p.code] = p))
}

async function loadAllLGUs() {
  const [cities, municipalities] = await Promise.all([
    fetchJSON<any[]>('https://psgc.cloud/api/cities'),
    fetchJSON<any[]>('https://psgc.cloud/api/municipalities')
  ])
  const cityList: LGU[] = cities.map(c => ({
    code: c.code,
    name: c.name,
    isCity: true,
    provinceCode: c.province_code || c.provinceCode || ''
  }))
  const muniList: LGU[] = municipalities.map(m => ({
    code: m.code,
    name: m.name,
    isCity: false,
    provinceCode: m.province_code || m.provinceCode || ''
  }))
  lguAll.value = [...cityList, ...muniList].sort((a, b) => a.name.localeCompare(b.name))
}

/* Load barangays for a selected city/municipality */
async function loadBarangaysForLGU(lguCode: string, isCity: boolean) {
  barangays.value = []
  if (!lguCode) return
  const url = isCity
    ? `https://psgc.cloud/api/barangays?city_code=${encodeURIComponent(lguCode)}`
    : `https://psgc.cloud/api/barangays?municipality_code=${encodeURIComponent(lguCode)}`
  const data = await fetchJSON<any[]>(url)
  barangays.value = data.map(b => ({ code: b.code, name: b.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/* Helpers */
function regionNameForLGU(l: LGU): string | null {
  const p = provinceByCode[l.provinceCode]
  if (!p) return null
  return regionNameByCode[p.regionCode] || null
}

/* Chaining via watchers (Region -> City -> Barangay) */
watch(addrRegion, (val) => {
  // Filter LGUs by region via provinces list (province->regionCode)
  const region = regions.value.find(x => x.name.toLowerCase() === val.trim().toLowerCase())
  if (region) {
    const provinceCodesInRegion = new Set(provinces.value.filter(p => p.regionCode === region.code).map(p => p.code))
    lguScoped.value = lguAll.value.filter(l => provinceCodesInRegion.has(l.provinceCode))
  } else {
    lguScoped.value = []
  }
  // Reset dependent fields when region changes
  addrCity.value = ''
  addrLine2.value = ''
  barangays.value = []
})

watch(addrCity, async (val) => {
  const list = lguScoped.value.length ? lguScoped.value : lguAll.value
  const l = list.find(x => x.name.toLowerCase() === val.trim().toLowerCase())
  if (l) {
    // Auto-backfill Region based on LGU -> Province -> Region
    const p = provinceByCode[l.provinceCode]
    if (p && regionNameByCode[p.regionCode]) {
      addrRegion.value = regionNameByCode[p.regionCode]
    }
    await loadBarangaysForLGU(l.code, l.isCity)
    addrLine2.value = '' // clear barangay if switching city
  } else {
    barangays.value = []
  }
})

/* Typeahead filters */
const filteredRegions = computed(() => {
  const q = addrRegion.value.trim().toLowerCase()
  if (!q) return regions.value.slice(0, 10)
  const starts = regions.value.filter(r => r.name.toLowerCase().startsWith(q))
  const contains = regions.value.filter(r => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

const filteredLGUs = computed(() => {
  const pool = lguScoped.value.length ? lguScoped.value : lguAll.value
  const q = addrCity.value.trim().toLowerCase()
  if (!q) return pool.slice(0, 10)
  const starts = pool.filter(l => l.name.toLowerCase().startsWith(q))
  const contains = pool.filter(l => !l.name.toLowerCase().startsWith(q) && l.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

const filteredBarangays = computed(() => {
  const q = addrLine2.value.trim().toLowerCase()
  if (!q) return barangays.value.slice(0, 10)
  const starts = barangays.value.filter(b => b.name.toLowerCase().startsWith(q))
  const contains = barangays.value.filter(b => !b.name.toLowerCase().startsWith(q) && b.name.toLowerCase().includes(q))
  return [...starts.slice(0, 10), ...contains.slice(0, 10 - Math.min(10, starts.length))]
})

/* NEW: input handlers to satisfy template references */
const onRegionInput = () => { showRegionSuggest.value = true }
const onCityInput = () => { showCitySuggest.value = true }
const onBarangayInput = () => { showBarangaySuggest.value = true }

/* Pick handlers */
function pickRegion(r: Region) {
  addrRegion.value = r.name
  showRegionSuggest.value = false
}
async function pickLGU(l: LGU) {
  addrCity.value = l.name
  showCitySuggest.value = false
  // backfill Region
  const p = provinceByCode[l.provinceCode]
  if (p && regionNameByCode[p.regionCode]) addrRegion.value = regionNameByCode[p.regionCode]
  await loadBarangaysForLGU(l.code, l.isCity)
  addrLine2.value = ''
}
function pickBarangay(b: Barangay) {
  addrLine2.value = b.name
  showBarangaySuggest.value = false
}

/* Single-line address: House/Street, Barangay, City/Muni, Region(or NCR), ZIP */
const fullAddress = computed(() => {
  const regionPart =
    addrRegion.value === 'National Capital Region (NCR)' ? 'NCR' : addrRegion.value
  const parts = [
    addrLine1.value,
    addrLine2.value,
    addrCity.value,
    regionPart,
    addrZip.value
  ].filter(Boolean)
  return parts.join(', ')
})
watch([addrLine1, addrLine2, addrCity, addrRegion, addrZip], () => {
  address.value = fullAddress.value
})

function isAddressComplete() {
  return !!(addrRegion.value && addrCity.value && addrZip.value && addrLine1.value)
}

/* Referral capture */
const referralCode = ref<string | null>(null)
onMounted(async () => {
  const qRef = route.query?.ref
  let code: string | null = null
  if (typeof qRef === 'string') code = qRef
  else if (Array.isArray(qRef) && qRef.length > 0) code = qRef[0]
  if (!code) code = new URLSearchParams(window.location.search).get('ref')
  referralCode.value = code ? code.trim() : null

  // Load PSGC datasets
  await Promise.all([loadRegions(), loadProvinces(), loadAllLGUs()])
})

/* Submit (kept from your original) */
const onSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    // Age gate (must be >= 18)
    if (typeof age.value !== 'number' || Number.isNaN(age.value) || age.value < 18) {
      loading.value = false
      error.value = 'You must be at least 18 years old to sign up.'
      return
    }

    if (!isAddressComplete()) {
      loading.value = false
      return (error.value = 'Please complete your address (Region, City/Municipality, Barangay (optional), ZIP, House/Street).')
    }

    // 1) Create auth user
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: { full_name: `${firstName.value} ${lastName.value}`.trim() },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      },
    })
    if (signErr) throw signErr

    const user = data.user
    if (!user?.id) {
      alert('Sign-up created, but no user ID returned. Please log in.')
      return router.push({ name: 'login' })
    }

    // Referral lookup
    let referredById: string | null = null
    if (referralCode.value) {
      const { data: refUser, error: refErr } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode.value)
        .maybeSingle()
      if (refErr && refErr.code !== 'PGRST116') throw refErr
      referredById = refUser?.id ?? null
    }

    // 2) Insert profile row
    const insertPayload: Record<string, any> = {
      id: user.id,
      email: email.value,
      full_name: `${firstName.value} ${lastName.value}`.trim(),
      address: fullAddress.value || null,
      age: Number.isFinite(Number(age.value)) ? Number(age.value) : null,
      phone_number: phone.value || null,
      // first_name: firstName.value, // Uncomment if you add these columns
      // last_name: lastName.value,
      // region: addrRegion.value,
      // city: addrCity.value,
      // barangay: addrLine2.value,
      // zip: addrZip.value,
      // address_line1: addrLine1.value,
    }
    if (referredById) insertPayload.referred_by = referredById

    const { error: insertErr } = await supabase.from('users').insert([insertPayload])
    if (insertErr && !/duplicate key value|unique constraint/i.test(insertErr.message)) throw insertErr

    // 3) referrals link table
    if (referredById && referredById !== user.id) {
      const { error: refLinkErr } = await supabase
        .from('referrals')
        .insert([{ referrer_id: referredById, referee_id: user.id }])
      if (refLinkErr && !/duplicate key value|unique constraint/i.test(refLinkErr.message)) {
        console.warn('Referral insert failed:', refLinkErr)
      }
    }

    const session = data.session ?? null
    alert(session ? 'Sign-up successful!' : 'Sign-up successful! Please check your email to confirm.')
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
.typeahead-menu {
  z-index: 1050;
  max-height: 280px;
  overflow: auto;
  top: 100%;
  left: 0;
}
@media only screen and (max-width: 431px) {
  .password-div { flex-direction: column; }
  .card { max-width: 400px; }
  .login-logo { height: 38px; }
}
</style>
